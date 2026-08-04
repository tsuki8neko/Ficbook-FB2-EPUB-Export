import { delay } from "../utils/delay.js";
import { escapeXml } from "../utils/escapeXml.js";
import { extractFootnotes } from "./getFootnotes.js";

const MAX_ATTEMPTS = 5;
const BLOCK_TAGS = new Set(["p", "div", "section", "article", "blockquote", "li", "h1", "h2", "h3", "h4"]);

function extractJsonObjectAfterMarker(source, marker) {
    const markerIndex = source.indexOf(marker);
    if (markerIndex < 0) return null;

    const start = source.indexOf("{", markerIndex + marker.length);
    if (start < 0) return null;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < source.length; i++) {
        const char = source[i];

        if (inString) {
            if (escaped) escaped = false;
            else if (char === "\\") escaped = true;
            else if (char === '"') inString = false;
            continue;
        }

        if (char === '"') {
            inString = true;
            continue;
        }
        if (char === "{") depth++;
        if (char === "}") {
            depth--;
            if (depth === 0) return source.slice(start, i + 1);
        }
    }

    return null;
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
    if (isCancelled()) throw new Error("cancelled");

    await delay(350 + Math.random() * 250);
    if (isCancelled()) throw new Error("cancelled");

    let response;
    try {
        response = await fetch(url, { credentials: "same-origin" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
        if (attempt < MAX_ATTEMPTS && !isCancelled()) {
            await delay(900 * attempt + Math.random() * 400);
            return getChapter(url, options, attempt + 1);
        }
        throw error;
    }

    const html = await response.text();
    const looksEmpty =
        !html ||
        html.length < 500 ||
        /cf-browser-verification|Cloudflare|Too Many Requests|<title>429|<title>502/i.test(html);

    if (looksEmpty) {
        if (attempt < MAX_ATTEMPTS && !isCancelled()) {
            await delay(1100 * attempt + Math.random() * 500);
            return getChapter(url, options, attempt + 1);
        }
        throw new Error(`Не удалось загрузить ${url}: пустой или служебный HTML`);
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

    if (!contentNode) {
        let best = null;
        let bestScore = 0;
        for (const element of doc.querySelectorAll("div, article, section")) {
            const text = (element.textContent || "").replace(/\s+/g, " ").trim();
            if (text.length < 200) continue;
            const className = String(element.className || "");
            if (/header|footer|menu|nav|comment|promo|settings|captcha/i.test(className)) continue;
            if (text.length > bestScore) {
                best = element;
                bestScore = text.length;
            }
        }
        contentNode = best;
    }

    if (!contentNode) throw new Error(`Не найден текст главы: ${url}`);

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

    let notesMap = {};
    const notesJson = extractJsonObjectAfterMarker(html, "textFootnotes");
    if (notesJson) {
        try {
            notesMap = JSON.parse(notesJson);
        } catch (error) {
            console.warn("Не удалось разобрать сноски главы:", url, error);
        }
    }

    const footnotes = extractFootnotes(doc, contentNode, notesMap);
    const { plain, xhtml } = buildChapterText(contentNode);
    return { title, plain, xhtml, footnotes };
}
