import { delay } from "../utils/delay.js";
import { escapeXml } from "../utils/escapeXml.js";
import { extractFootnotes } from "./getFootnotes.js";
import { fetchTextWithRetries } from "../utils/network.js";

const MAX_ATTEMPTS = 5;
const BLOCK_TAGS = new Set(["p", "div", "section", "article", "blockquote", "li", "h1", "h2", "h3", "h4"]);

function extractAssignedLiteralAfterMarker(source, marker) {
    const markerIndex = source.indexOf(marker);
    if (markerIndex < 0) return null;

    const equalsIndex = source.indexOf("=", markerIndex + marker.length);
    if (equalsIndex < 0) return null;

    let start = equalsIndex + 1;
    while (start < source.length && /\s/.test(source[start])) start++;
    if (start >= source.length) return null;

    const opening = source[start];
    if (opening !== "{" && opening !== "[") {
        // На случай null/undefined или другого простого литерала.
        const end = source.indexOf(";", start);
        return source.slice(start, end < 0 ? source.length : end).trim() || null;
    }

    const pairs = { "{": "}", "[": "]" };
    const stack = [];
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let i = start; i < source.length; i++) {
        const char = source[i];
        const next = source[i + 1];

        if (lineComment) {
            if (char === "\n") lineComment = false;
            continue;
        }
        if (blockComment) {
            if (char === "*" && next === "/") {
                blockComment = false;
                i++;
            }
            continue;
        }
        if (quote) {
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === quote) quote = null;
            continue;
        }

        if (char === "/" && next === "/") {
            lineComment = true;
            i++;
            continue;
        }
        if (char === "/" && next === "*") {
            blockComment = true;
            i++;
            continue;
        }
        if (char === '"' || char === "'" || char === "`") {
            quote = char;
            continue;
        }

        if (char === "{" || char === "[") {
            stack.push(pairs[char]);
            continue;
        }
        if (char === "}" || char === "]") {
            if (!stack.length || stack[stack.length - 1] !== char) return null;
            stack.pop();
            if (!stack.length) return source.slice(start, i + 1);
        }
    }

    return null;
}

/**
 * Безопасный разбор простого JavaScript object literal без eval/new Function.
 * Ficbook стал отдавать textFootnotes с некавыченными ключами, поэтому
 * строгий JSON.parse больше не всегда подходит.
 */
function parseObjectLiteral(source) {
    let index = 0;

    function fail(message) {
        throw new SyntaxError(`${message} at position ${index}`);
    }

    function skipSpace() {
        while (index < source.length) {
            if (/\s/.test(source[index])) {
                index++;
                continue;
            }
            if (source[index] === "/" && source[index + 1] === "/") {
                index += 2;
                while (index < source.length && source[index] !== "\n") index++;
                continue;
            }
            if (source[index] === "/" && source[index + 1] === "*") {
                index += 2;
                const end = source.indexOf("*/", index);
                if (end < 0) fail("Unterminated comment");
                index = end + 2;
                continue;
            }
            break;
        }
    }

    function parseString() {
        const quote = source[index++];
        let value = "";
        while (index < source.length) {
            const char = source[index++];
            if (char === quote) return value;
            if (char !== "\\") {
                value += char;
                continue;
            }

            if (index >= source.length) fail("Unterminated escape");
            const escape = source[index++];
            const simple = {
                n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v",
                "0": "\0", "\\": "\\", "'": "'", '"': '"', "`": "`"
            };
            if (Object.prototype.hasOwnProperty.call(simple, escape)) {
                value += simple[escape];
            } else if (escape === "x") {
                const hex = source.slice(index, index + 2);
                if (!/^[0-9a-f]{2}$/i.test(hex)) fail("Invalid hex escape");
                value += String.fromCharCode(parseInt(hex, 16));
                index += 2;
            } else if (escape === "u") {
                if (source[index] === "{") {
                    const close = source.indexOf("}", index + 1);
                    if (close < 0) fail("Invalid Unicode escape");
                    const hex = source.slice(index + 1, close);
                    if (!/^[0-9a-f]+$/i.test(hex)) fail("Invalid Unicode escape");
                    value += String.fromCodePoint(parseInt(hex, 16));
                    index = close + 1;
                } else {
                    const hex = source.slice(index, index + 4);
                    if (!/^[0-9a-f]{4}$/i.test(hex)) fail("Invalid Unicode escape");
                    value += String.fromCharCode(parseInt(hex, 16));
                    index += 4;
                }
            } else if (escape === "\n") {
                // JavaScript line continuation.
            } else if (escape === "\r") {
                if (source[index] === "\n") index++;
            } else {
                // JS допускает экранирование обычного символа: \<char> -> <char>.
                value += escape;
            }
        }
        fail("Unterminated string");
    }

    function parseNumber() {
        const match = source.slice(index).match(/^-?(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/);
        if (!match) fail("Invalid number");
        index += match[0].length;
        return Number(match[0]);
    }

    function parseIdentifier() {
        const match = source.slice(index).match(/^[A-Za-z_$][\w$-]*/);
        if (!match) fail("Expected identifier");
        index += match[0].length;
        return match[0];
    }

    function parseArray() {
        const value = [];
        index++;
        skipSpace();
        if (source[index] === "]") {
            index++;
            return value;
        }
        while (index < source.length) {
            value.push(parseValue());
            skipSpace();
            if (source[index] === ",") {
                index++;
                skipSpace();
                if (source[index] === "]") {
                    index++;
                    return value;
                }
                continue;
            }
            if (source[index] === "]") {
                index++;
                return value;
            }
            fail("Expected ',' or ']'");
        }
        fail("Unterminated array");
    }

    function parseObject() {
        const value = {};
        index++;
        skipSpace();
        if (source[index] === "}") {
            index++;
            return value;
        }

        while (index < source.length) {
            skipSpace();
            let key;
            if (source[index] === '"' || source[index] === "'" || source[index] === "`") {
                key = parseString();
            } else {
                const numberKey = source.slice(index).match(/^-?\d+(?:\.\d+)?/);
                if (numberKey) {
                    key = numberKey[0];
                    index += numberKey[0].length;
                } else {
                    key = parseIdentifier();
                }
            }

            skipSpace();
            if (source[index] !== ":") fail("Expected ':'");
            index++;
            value[String(key)] = parseValue();
            skipSpace();

            if (source[index] === ",") {
                index++;
                skipSpace();
                if (source[index] === "}") {
                    index++;
                    return value;
                }
                continue;
            }
            if (source[index] === "}") {
                index++;
                return value;
            }
            fail("Expected ',' or '}'");
        }
        fail("Unterminated object");
    }

    function parseValue() {
        skipSpace();
        const char = source[index];
        if (char === "{") return parseObject();
        if (char === "[") return parseArray();
        if (char === '"' || char === "'" || char === "`") return parseString();
        if (char === "-" || /\d/.test(char || "")) return parseNumber();

        const identifier = parseIdentifier();
        if (identifier === "true") return true;
        if (identifier === "false") return false;
        if (identifier === "null" || identifier === "undefined") return null;
        return identifier;
    }

    const result = parseValue();
    skipSpace();
    if (index !== source.length) fail("Unexpected trailing input");
    return result;
}

function parseFootnotesMap(source) {
    try {
        return JSON.parse(source);
    } catch (_) {
        return parseObjectLiteral(source);
    }
}

function serializeText(node) {
    if (!node) return "";
    if (node.nodeType === Node.TEXT_NODE) return escapeXml(node.nodeValue || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = node.tagName.toLowerCase();
    if (["script", "style", "noscript"].includes(tag)) return "";
    if (tag === "br") return "\n";
    if (tag === "footnote-ref") {
        return `<footnote-ref id="${escapeXml(node.getAttribute("id") || "")}" number="${escapeXml(node.getAttribute("number") || "")}"></footnote-ref>`;
    }

    const inner = Array.from(node.childNodes).map(serializeText).join("");
    return BLOCK_TAGS.has(tag) ? `\n${inner}\n` : inner;
}

function normalizeSerializedLine(line) {
    return line
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\s+(<footnote-ref)/g, " $1")
        .replace(/(<\/footnote-ref>)\s+/g, "$1 ")
        .trim();
}

function xmlLineToPlain(line) {
    const withRefs = line.replace(
        /<footnote-ref[^>]*number=["'](\d+)["'][^>]*><\/footnote-ref>/g,
        "[$1]"
    );
    const parsed = new DOMParser().parseFromString(`<root>${withRefs}</root>`, "application/xml");
    return parsed.querySelector("parsererror") ? withRefs.replace(/<[^>]+>/g, "") : parsed.documentElement.textContent;
}

function buildChapterText(contentNode) {
    const serialized = serializeText(contentNode);
    const lines = serialized
        .split(/\n+/)
        .map(normalizeSerializedLine)
        .filter(Boolean);

    return {
        xhtml: lines.map(line => `<p>${line}</p>`).join("\n"),
        plain: lines.map(xmlLineToPlain).join("\n\n")
    };
}

export async function getChapter(url, options = {}, attempt = 1) {
    const isCancelled = options.isCancelled || (() => false);
    const onNetworkState = typeof options.onNetworkState === "function"
        ? options.onNetworkState
        : () => {};

    if (isCancelled()) throw new Error("cancelled");

    // Сохраняем защитную задержку перед каждым запросом Ficbook.
    await delay(350 + Math.random() * 250);
    if (isCancelled()) throw new Error("cancelled");

    try {
        const { text: html } = await fetchTextWithRetries(url, {
            credentials: "same-origin",
            isCancelled,
            onState: onNetworkState,
            // Повтор всей главы ниже уже делает до MAX_ATTEMPTS попыток.
            // Здесь нужна прежде всего корректная обработка offline/timeout.
            maxAttempts: 1,
            requestTimeoutMs: 45000
        });

        const looksEmpty =
            !html ||
            html.length < 500 ||
            /cf-browser-verification|Cloudflare|Too Many Requests|<title>\s*(?:429|500|502|503|504)/i.test(html);

        // Если соединение оборвалось посреди ответа, response.text() обычно
        // отклоняется. Дополнительно проверяем закрывающий тег, чтобы не принять
        // редкий усечённый HTTP 200 за полноценную страницу главы.
        const looksTruncated = !/<\/body\s*>/i.test(html) && !/<\/html\s*>/i.test(html);

        if (looksEmpty || looksTruncated) {
            const error = new Error(
                `Не удалось загрузить ${url}: ${looksTruncated ? "ответ сервера оборвался" : "пустой или служебный HTML"}`
            );
            error.retryable = true;
            throw error;
        }

        if (isCancelled()) throw new Error("cancelled");
        const doc = new DOMParser().parseFromString(html, "text/html");
        const title =
            doc.querySelector(".title-area h2, .part-title h3, .part-title h2, .part-title")?.textContent?.trim() ||
            "Глава";

        let contentNode =
            doc.querySelector(".part_text") ||
            doc.querySelector("#content .part_text") ||
            doc.querySelector("[itemprop='articleBody']");

        // Резерв для изменения разметки Ficbook. Он используется только на
        // полноценной HTML-странице и затем дополнительно проверяется на текст.
        if (!contentNode) {
            let best = null;
            let bestScore = 0;
            for (const element of doc.querySelectorAll("div, article, section")) {
                const text = (element.textContent || "").replace(/\s+/g, " ").trim();
                if (text.length < 200) continue;
                const className = String(element.className || "");
                if (/header|footer|menu|nav|comment|promo|settings|captcha|login|auth/i.test(className)) continue;
                if (text.length > bestScore) {
                    best = element;
                    bestScore = text.length;
                }
            }
            contentNode = best;
        }

        if (!contentNode) {
            const error = new Error(`Не найден текст главы: ${url}`);
            error.retryable = true;
            throw error;
        }

        contentNode.querySelectorAll(`
            .js-text-settings,
            .js-text-settings-collapse-button,
            .text_settings,
            .text-settings,
            .text-settings-panel,
            .fanfic-text-promo,
            .copy-button,
            .ad,
            .promo,
            .chapter-time
        `.replace(/\s+/g, " ")).forEach(element => element.remove());

        const visibleText = (contentNode.textContent || "").replace(/\s+/g, " ").trim();
        if (!visibleText) {
            const error = new Error(`Текст главы оказался пустым: ${url}`);
            error.retryable = true;
            throw error;
        }

        let notesMap = {};
        const notesLiteral = extractAssignedLiteralAfterMarker(html, "textFootnotes");
        if (notesLiteral) {
            try {
                notesMap = parseFootnotesMap(notesLiteral);
            } catch (error) {
                console.warn("Не удалось разобрать сноски главы:", url, error);
            }
        }

        const footnotes = extractFootnotes(doc, contentNode, notesMap);
        const { plain, xhtml } = buildChapterText(contentNode);

        if (!plain.trim() || !xhtml.trim()) {
            const error = new Error(`После обработки текст главы оказался пустым: ${url}`);
            error.retryable = true;
            throw error;
        }

        onNetworkState("");
        return { title, plain, xhtml, footnotes };
    } catch (error) {
        if (error?.message === "cancelled" || isCancelled()) throw new Error("cancelled");

        if (attempt < MAX_ATTEMPTS) {
            const nextAttempt = attempt + 1;
            onNetworkState(`Глава не загрузилась полностью. Повтор ${nextAttempt}/${MAX_ATTEMPTS}…`);
            await delay(1100 * attempt + Math.random() * 500);
            return getChapter(url, options, nextAttempt);
        }

        throw error;
    }
}

