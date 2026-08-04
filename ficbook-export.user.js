// ==UserScript==
// @name           Ficbook Exporter — FB2, EPUB, TXT and PDF
// @name:ru        Скачивание книг с Фикбука в FB2, EPUB, TXT и PDF
// @name:en        Ficbook Exporter — FB2, EPUB, TXT and PDF
// @namespace      http://tampermonkey.net/
// @version        1.8.1
// @build          2026-08-04 06:28
// @description    Export Ficbook works to FB2, EPUB, TXT and PDF with embedded covers
// @description:en Export Ficbook works to FB2, EPUB, TXT and PDF with embedded covers
// @description:ru Экспорт произведений Фикбука в FB2, EPUB, TXT и PDF со встроенными обложками
// @author         tsuki8neko
// @match          https://ficbook.net/readfic/*
// @grant          GM_xmlhttpRequest
// @connect        ficbook.net
// @connect        *.ficbook.net
// @connect        assets.teinon.net
// @connect        *.teinon.net
// @connect        cdnjs.cloudflare.com
// @connect        cdn.jsdelivr.net
// @connect        unpkg.com
// @license        Apache-2.0
// @updateURL      https://raw.githubusercontent.com/tsuki8neko/Ficbook-FB2-EPUB-Export/master/ficbook-export.user.js
// @downloadURL    https://raw.githubusercontent.com/tsuki8neko/Ficbook-FB2-EPUB-Export/master/ficbook-export.user.js
// ==/UserScript==


;// ./src/core/getTitle.js
function getTitle(doc = document) {
    const node =
        doc.querySelector("h1.heading[itemprop='name']") ||
        doc.querySelector("h1.heading[itemprop='headline']") ||
        doc.querySelector("h1.heading") ||
        doc.querySelector("h1[itemprop='name']");

    return node?.textContent?.trim() || "Фанфик";
}

;// ./src/core/getAuthors.js
function absoluteUrl(value) {
    if (!value) return "";
    const base = location.origin && location.origin !== "null" ? location.origin : "https://ficbook.net";
    try { return new URL(value, base).href; } catch (_) { return value; }
}

function getAuthors(doc = document) {
    const hat = doc.querySelector(".fanfic-hat-body") || doc;
    const creators = hat.querySelectorAll(".creator-info");

    return Array.from(creators)
        .map(c => {
            const nameNode = c.querySelector(".creator-username");
            const roleNode = c.querySelector(".small-text.text-muted");
            const role = roleNode?.textContent?.trim().toLowerCase().replace(/[:：]+$/, "") || "автор";

            return {
                name: nameNode?.textContent?.trim() || "",
                url: absoluteUrl(nameNode?.getAttribute("href")),
                role
            };
        })
        .filter(author => author.name);
}

;// ./src/core/getMeta.js
function getMeta_absoluteUrl(value) {
    if (!value) return "";

    const base =
        location.origin && location.origin !== "null"
            ? location.origin
            : "https://ficbook.net";

    try {
        return new URL(value, base).href;
    } catch (_) {
        return value;
    }
}

function uniqueValues(values) {
    return [...new Set(values.filter(Boolean))];
}

function getTagSections(doc) {
    const blocks = Array.from(
        doc.querySelectorAll(
            ".description .mb-10, " +
            ".fanfic-hat-body .mb-10"
        )
    );

    return blocks
        .map(block => {
            const tagsContainer = block.querySelector(".tags");
            if (!tagsContainer) return null;

            const labelNode = block.querySelector("strong");
            const label = labelNode?.textContent
                ?.replace(/\s+/g, " ")
                .trim()
                .replace(/[:：]\s*$/, "");

            if (!label) return null;

            const sectionTags = uniqueValues(
                Array.from(
                    tagsContainer.querySelectorAll("a[href*='/tags/']")
                ).map(link =>
                    link.textContent
                        .replace(/\s+/g, " ")
                        .trim()
                )
            );

            if (!sectionTags.length) return null;

            return {
                label,
                tags: sectionTags
            };
        })
        .filter(Boolean);
}

function getExtraData(doc = document) {
    const findBlock = label =>
        Array.from(
            doc.querySelectorAll(
                ".description .mb-10, " +
                ".fanfic-hat-body .mb-10"
            )
        ).find(node =>
            node.querySelector("strong")
                ?.textContent
                ?.includes(label)
        );

    const fandomBlock = findBlock("Фэндом:");

    const fandom = fandomBlock
        ? uniqueValues(
            Array.from(fandomBlock.querySelectorAll("a"))
                .map(link =>
                    link.textContent
                        .replace(/\s+/g, " ")
                        .trim()
                )
        ).join(", ")
        : "";

    const sizeBlock = findBlock("Размер:");
    const sizeText = sizeBlock?.textContent || "";
    const sizeMatch = sizeText.match(/(\d[\d\s\u00a0]*\d|\d)\s*слов/i);

    const size = sizeMatch
        ? sizeMatch[1]
            .replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        : "";

    /*
     * Сохраняем группы меток отдельно:
     *
     * tagSections = [
     *     {
     *         label: "Предупреждения",
     *         tags: ["Похищение", "Счастливый финал"]
     *     },
     *     {
     *         label: "Другие метки",
     *         tags: ["AU", "Hurt/Comfort", "Драма"]
     *     }
     * ]
     */
    const tagSections = getTagSections(doc);

    /*
     * Общий список оставляем для обратной совместимости.
     * Он используется в метаданных EPUB, FB2 и других форматах.
     */
    const tags = uniqueValues(
        tagSections.flatMap(section => section.tags)
    ).join(", ");

    const description = doc.querySelector(
        ".description .js-public-beta-description, " +
        ".fanfic-hat-body .js-public-beta-description"
    )?.textContent?.trim() || "";

    const notes = doc.querySelector(
        ".description .js-public-beta-author-comment, " +
        ".fanfic-hat-body .js-public-beta-author-comment"
    )?.textContent?.trim() || "";

    const otherPublicationBlock = findBlock(
        "Публикация на других ресурсах:"
    );

    let otherPublication = "";

    if (otherPublicationBlock) {
        const clone = otherPublicationBlock.cloneNode(true);
        clone.querySelector("strong")?.remove();

        otherPublication = (clone.textContent || "")
            .replace(/^\s*[:：]?\s*/, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    const pairingBlock =
        findBlock("Пэйринг и персонажи:") ||
        findBlock("Пейринг и персонажи:");

    const pairings = pairingBlock
        ? uniqueValues(
            Array.from(pairingBlock.querySelectorAll("a"))
                .map(link =>
                    link.textContent
                        .replace(/\s+/g, " ")
                        .trim()
                )
        )
        : [];

    return {
        fandom,
        size,
        tags,
        tagSections,
        description,
        notes,
        otherPublication,
        pairings
    };
}

function getDirectionRatingStatus(doc = document) {
    const root = doc.querySelector(".fanfic-badges");

    if (!root) {
        return {
            direction: "",
            rating: "",
            status: ""
        };
    }

    const directionNode = root.querySelector("[class*='direction']");

    const direction =
        directionNode?.querySelector("span")?.textContent?.trim() ||
        directionNode?.textContent?.trim() ||
        "";

    const ratingNode = root.querySelector(
        "[class*='ds-label-rating'], " +
        "[class*='badge-rating']"
    );

    const rating = ratingNode?.textContent?.trim() || "";

    const statusNode = root.querySelector(
        "[class*='ds-label-status'], " +
        "[class*='badge-status']"
    );

    const status = statusNode?.textContent?.trim() || "";

    return {
        direction,
        rating,
        status
    };
}

function getOriginalAuthor(doc = document) {
    for (const block of doc.querySelectorAll(".mb-10")) {
        const label =
            block.querySelector("strong")
                ?.textContent
                ?.trim() || "";

        if (!label.startsWith("Автор оригинала")) continue;

        const link = block.querySelector("a");

        return {
            name: link?.textContent?.trim() || "",
            url: getMeta_absoluteUrl(link?.getAttribute("href"))
        };
    }

    return null;
}

function getOriginalWork(doc = document) {
    for (const block of doc.querySelectorAll(".mb-10")) {
        const label =
            block.querySelector("strong")
                ?.textContent
                ?.trim() || "";

        if (!label.startsWith("Оригинал")) continue;

        const link = block.querySelector("a");
        if (!link) return null;

        let url =
            link.href ||
            link.getAttribute("href") ||
            "";

        try {
            const base =
                location.origin && location.origin !== "null"
                    ? location.origin
                    : "https://ficbook.net";

            const parsed = new URL(url, base);

            if (
                parsed.pathname.includes("/away") &&
                parsed.searchParams.has("url")
            ) {
                url = parsed.searchParams.get("url") || "";
            } else {
                url = parsed.href;
            }
        } catch (_) {
            // Оставляем исходную строку, если URL некорректен.
        }

        return { url };
    }

    return null;
}
;// ./src/utils/delay.js
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

;// ./src/utils/escapeXml.js
/** Экранирует текст для XML/XHTML. */
function escapeXml(value = "") {
    return String(value)
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

;// ./src/core/getFootnotes.js


/** Заменяет сноски в тексте на нейтральные placeholder-элементы. */
function extractFootnotes(doc, contentNode, notesMap = {}) {
    const anchors = [...contentNode.querySelectorAll("span.footnote[id]")];
    const notes = [];

    anchors.forEach((anchor, index) => {
        const id = anchor.id;
        const rawHtml = notesMap[id];
        if (!rawHtml) return;

        const number = index + 1;
        const holder = doc.createElement("div");
        holder.innerHTML = String(rawHtml);
        const text = (holder.textContent || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

        const ref = doc.createElement("footnote-ref");
        ref.setAttribute("id", id);
        ref.setAttribute("number", String(number));
        anchor.replaceWith(ref);

        notes.push({ id, number, text, html: escapeXml(text) });
    });

    return notes;
}

;// ./src/core/getChapter.js




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

async function getChapter(url, options = {}, attempt = 1) {
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

;// ./src/core/getCover.js
const REAL_COVER_SELECTOR =
    ".fanfic-hat-cover picture img, " +
    ".fanfic-hat-cover img";

function candidateFromNode(node) {
    if (!node) return "";

    const srcset =
        node.getAttribute("srcset") ||
        node.getAttribute("data-srcset") ||
        "";

    if (srcset) {
        const candidates = srcset
            .split(",")
            .map(part => {
                const [url, descriptor = ""] = part.trim().split(/\s+/, 2);

                const score = descriptor.endsWith("w")
                    ? Number.parseFloat(descriptor)
                    : descriptor.endsWith("x")
                        ? Number.parseFloat(descriptor) * 10000
                        : 0;

                return {
                    url,
                    score: Number.isFinite(score) ? score : 0
                };
            })
            .filter(item => item.url);

        candidates.sort((a, b) => b.score - a.score);

        if (candidates[0]?.url) {
            return candidates[0].url;
        }
    }

    return (
        node.getAttribute("data-src") ||
        node.getAttribute("src") ||
        ""
    );
}

function getCover_absoluteUrl(value, doc = document) {
    if (!value) return "";

    try {
        const fallbackBase =
            location.origin && location.origin !== "null"
                ? location.origin
                : "https://ficbook.net";

        const base =
            doc.baseURI && doc.baseURI !== "about:blank"
                ? doc.baseURI
                : fallbackBase;

        return new URL(value, base).href;
    } catch (_) {
        return "";
    }
}

function isRealFicbookCover(value) {
    if (!value) return false;

    try {
        const url = new URL(value);

        /*
         * Настоящие обложки произведений Ficbook хранятся
         * в каталоге /fanfic-covers/.
         *
         * Благодаря этой проверке логотипы, аватары,
         * рекламные картинки и изображения-заглушки
         * не попадут в книгу.
         */
        if (!url.pathname.includes("/fanfic-covers/")) {
            return false;
        }

        if (
            /avatar|logo|favicon|placeholder|default|no[-_]?cover/i.test(
                url.pathname
            )
        ) {
            return false;
        }

        return true;
    } catch (_) {
        return false;
    }
}

function findCoverUrl(doc = document) {
    /*
     * Не используем og:image и другие резервные картинки.
     * Если на странице нет настоящего блока обложки,
     * считаем, что обложки у произведения нет.
     */
    const coverRoot = doc.querySelector(".fanfic-hat-cover");
    if (!coverRoot) return "";

    const image = doc.querySelector(REAL_COVER_SELECTOR);
    if (!image) return "";

    const value = candidateFromNode(image);

    if (!value || value.startsWith("data:")) {
        return "";
    }

    const href = getCover_absoluteUrl(value, doc);

    if (!isRealFicbookCover(href)) {
        return "";
    }

    return href;
}

function headerValue(headers, name) {
    const match = String(headers || "").match(
        new RegExp(`^${name}:\\s*(.+)$`, "im")
    );

    return match?.[1]?.trim() || "";
}

function gmRequestBlob(url) {
    return new Promise((resolve, reject) => {
        const request =
            globalThis.GM_xmlhttpRequest ||
            globalThis.GM?.xmlHttpRequest;

        if (!request) {
            reject(new Error("GM_xmlhttpRequest недоступен"));
            return;
        }

        request({
            method: "GET",
            url,
            responseType: "arraybuffer",
            timeout: 30000,

            onload: response => {
                if (
                    response.status < 200 ||
                    response.status >= 300 ||
                    !response.response
                ) {
                    reject(new Error(`HTTP ${response.status}`));
                    return;
                }

                const contentType =
                    headerValue(
                        response.responseHeaders,
                        "content-type"
                    ) || "application/octet-stream";

                /*
                 * Дополнительно проверяем, что сервер действительно
                 * вернул изображение, а не HTML-страницу ошибки.
                 */
                if (!contentType.toLowerCase().startsWith("image/")) {
                    reject(
                        new Error(
                            `Получен неподходящий тип файла: ${contentType}`
                        )
                    );
                    return;
                }

                resolve(
                    new Blob(
                        [response.response],
                        { type: contentType }
                    )
                );
            },

            onerror: () => {
                reject(new Error("Ошибка загрузки обложки"));
            },

            ontimeout: () => {
                reject(new Error("Тайм-аут загрузки обложки"));
            }
        });
    });
}

async function fetchBlob(url) {
    /*
     * Сначала используем GM-запрос, поскольку он
     * не зависит от CORS страницы Ficbook.
     */
    try {
        return await gmRequestBlob(url);
    } catch (gmError) {
        try {
            const response = await fetch(url, {
                credentials: "omit",
                mode: "cors"
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const contentType =
                response.headers.get("content-type") || "";

            if (!contentType.toLowerCase().startsWith("image/")) {
                throw new Error(
                    `Получен неподходящий тип файла: ${contentType || "неизвестно"}`
                );
            }

            return await response.blob();
        } catch (fetchError) {
            throw new Error(
                `Не удалось скачать обложку: ` +
                `${gmError.message}; ${fetchError.message}`
            );
        }
    }
}

function loadImage(blob) {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(blob);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);

            reject(
                new Error(
                    "Браузер не смог декодировать изображение"
                )
            );
        };

        image.src = objectUrl;
    });
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(
                        new Error(
                            "Не удалось преобразовать обложку"
                        )
                    );
                }
            },
            type,
            quality
        );
    });
}

async function normalizeToJpeg(blob) {
    const image = await loadImage(blob);

    if (!image.naturalWidth || !image.naturalHeight) {
        throw new Error("Изображение имеет нулевой размер");
    }

    const maxWidth = 1600;
    const maxHeight = 2400;

    const scale = Math.min(
        1,
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight
    );

    const width = Math.max(
        1,
        Math.round(image.naturalWidth * scale)
    );

    const height = Math.max(
        1,
        Math.round(image.naturalHeight * scale)
    );

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
        alpha: false
    });

    if (!context) {
        throw new Error("Canvas 2D недоступен");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return {
        blob: await canvasToBlob(
            canvas,
            "image/jpeg",
            0.9
        ),
        width,
        height
    };
}

function bytesToBase64(bytes) {
    let binary = "";
    const chunkSize = 0x8000;

    for (
        let index = 0;
        index < bytes.length;
        index += chunkSize
    ) {
        binary += String.fromCharCode(
            ...bytes.subarray(
                index,
                index + chunkSize
            )
        );
    }

    return btoa(binary);
}

async function getCover(doc = document) {
    const sourceUrl = findCoverUrl(doc);

    /*
     * Если настоящей обложки нет, возвращаем null.
     * Экспортёры должны создать книгу без обложки.
     */
    if (!sourceUrl) return null;

    try {
        const originalBlob = await fetchBlob(sourceUrl);
        const normalized = await normalizeToJpeg(originalBlob);

        const bytes = new Uint8Array(
            await normalized.blob.arrayBuffer()
        );

        const base64 = bytesToBase64(bytes);

        return {
            sourceUrl,
            blob: normalized.blob,
            bytes,
            base64,
            dataUrl: `data:image/jpeg;base64,${base64}`,
            mediaType: "image/jpeg",
            fileName: "cover.jpg",
            width: normalized.width,
            height: normalized.height
        };
    } catch (error) {
        console.warn(
            "Обложка найдена, но не добавлена:",
            sourceUrl,
            error
        );

        return null;
    }
}
;// ./src/core/collectBook.js







function currentWorkUrl() {
    const url = new URL(location.href);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "readfic" || !parts[1]) throw new Error("Откройте страницу произведения или главы Ficbook.");
    return new URL(`/readfic/${parts[1]}`, url.origin).href;
}

async function loadWorkDocument(workUrl) {
    const current = new URL(location.href);
    const work = new URL(workUrl);
    if (current.pathname.replace(/\/$/, "") === work.pathname.replace(/\/$/, "")) return document;

    const response = await fetch(workUrl, { credentials: "same-origin" });
    if (!response.ok) throw new Error(`Не удалось загрузить страницу произведения: HTTP ${response.status}`);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc.querySelector(".fanfic-hat-body, h1.heading")) {
        throw new Error("Страница произведения загружена, но её структура не распознана.");
    }
    return doc;
}

function isRole(author, role) {
    return author.role === role;
}

function extractSeries(doc) {
    const link = doc.querySelector(".mb-10 a[href^='/series/']");
    if (!link) return null;
    return {
        name: link.textContent?.trim() || "",
        url: new URL(link.getAttribute("href"), location.origin && location.origin !== "null" ? location.origin : "https://ficbook.net").href
    };
}

function extractChapterUrls(doc, workUrl) {
    const urls = Array.from(doc.querySelectorAll(".list-of-fanfic-parts .part-link"))
        .map(link => link.getAttribute("href") || link.href || "")
        .filter(Boolean)
        .map(href => new URL(href, workUrl).href.split("#")[0])
        .filter(href => {
            if (href.includes("/all-parts")) return false;
            const last = new URL(href).pathname.split("/").filter(Boolean).pop();
            return /^\d+$/.test(last || "");
        });

    return [...new Set(urls.length ? urls : [workUrl])];
}

async function loadChapters(urls, onProgress, isCancelled) {
    const results = new Array(urls.length).fill(null);
    let pending = urls.map((_, index) => index);
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts && pending.length; attempt++) {
        const failed = [];

        for (const index of pending) {
            if (isCancelled()) throw new Error("cancelled");
            onProgress(index + 1, urls.length);

            if (attempt > 1) await delay(700 + Math.random() * 500);

            try {
                results[index] = {
                    ...(await getChapter(urls[index], { isCancelled })),
                    url: urls[index],
                    number: index + 1
                };
            } catch (error) {
                if (error.message === "cancelled") throw error;
                console.warn(
                    `Не удалось загрузить главу (попытка ${attempt}/${maxAttempts}):`,
                    urls[index],
                    error
                );
                failed.push(index);
            }
        }

        pending = failed;
    }

    if (pending.length) {
        const failedLines = pending
            .map(index => `${index + 1}. ${urls[index]}`)
            .join("\n");
        const error = new Error(
            `Не удалось загрузить ${pending.length} из ${urls.length} глав после трёх попыток.\n\n` +
            "Файл не создан, чтобы не сохранять неполный текст. Повторите экспорт позже.\n\n" +
            `Проблемные главы:\n${failedLines}`
        );
        error.name = "IncompleteBookError";
        error.failedUrls = pending.map(index => urls[index]);
        throw error;
    }

    return results;
}

async function collectBook(onProgress = () => {}, isCancelled = () => false) {
    const workUrl = currentWorkUrl();
    const doc = await loadWorkDocument(workUrl);

    const title = getTitle(doc);
    const authors = getAuthors(doc);
    const originalAuthor = getOriginalAuthor(doc);
    const originalWork = getOriginalWork(doc);
    const translators = authors.filter(author => isRole(author, "переводчик"));
    const mainAuthor = authors.find(author => isRole(author, "автор")) || originalAuthor || translators[0] || null;

    if (!mainAuthor) throw new Error("Автор не найден. Возможно, Ficbook изменил разметку страницы.");

    const meta = {
        title,
        authors,
        mainAuthor,
        coauthors: authors.filter(author => isRole(author, "соавтор")),
        translators,
        betas: authors.filter(author => isRole(author, "бета")),
        gammas: authors.filter(author => isRole(author, "гамма")),
        originalAuthor,
        originalWork,
        ...getExtraData(doc),
        ...getDirectionRatingStatus(doc),
        series: extractSeries(doc),
        sourceUrl: workUrl
    };

    const cover = await getCover(doc);
    if (isCancelled()) throw new Error("cancelled");
    const chapterUrls = extractChapterUrls(doc, workUrl);
    const chapters = await loadChapters(chapterUrls, onProgress, isCancelled);

    if (!chapters.length) throw new Error("Не удалось загрузить главы произведения.");
    return { meta, cover, chapters };
}

;// ./src/utils/generateFileName.js
/** Подготавливает безопасную часть имени файла для Windows/macOS/Linux.
    * Итоговый формат:
    * author_-_title
 */
function sanitizeFilePart(value, fallback = "Без_названия") {
    let result = String(value || "")
        .normalize("NFC")
        .replace(/[\u0000-\u001F\u007F]/g, "")
        .replace(/[\\/:*?"<>|]+/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/[ ._]+$/g, "")
        .replace(/^[ ._]+/g, "")
        .slice(0, 110);

    if (!result) result = fallback;
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(result)) result = `_${result}`;
    return result;
}

function generateFileBaseName(mainAuthorName, title) {
    return `${sanitizeFilePart(mainAuthorName, "UnknownAuthor")}_-_${sanitizeFilePart(title)}`;
}

;// ./src/utils/download.js
function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

;// ./src/utils/id.js
function createBookId() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}

;// ./src/utils/textToParagraphs.js
/**
 * textToParagraphs Преобразует обычный текст в XHTML-параграфы.
 *
 * - разбивает текст по переносам строк
 * - удаляет пустые строки
 * - экранирует XML-символы
 * - оборачивает каждую строку в <p>
 */



function textToParagraphs(text) {
    return text.split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${escapeXml(line)}</p>`)
        .join("\n");
}

;// ./src/fb2/fb2Header.js



function personXml(person) {
    if (!person) return "";

    return `
            <author>
                <nickname>${escapeXml(person.name)}</nickname>
                ${person.url ? `<home-page>${escapeXml(person.url)}</home-page>` : ""}
            </author>`;
}

function annotationPerson(label, people) {
    if (!people?.length) return "";

    const value = people
        .map(person =>
            person.url
                ? `${escapeXml(person.name)} (${escapeXml(person.url)})`
                : escapeXml(person.name)
        )
        .join(", ");

    return `<p><strong>${escapeXml(label)}:</strong> ${value}</p>`;
}

function externalLinkXml(url, label = url) {
    if (!url) return "";

    return `<a xlink:href="${escapeXml(url)}">${escapeXml(label)}</a>`;
}

/**
 * Выводит разделы меток Ficbook отдельно:
 *
 * Предупреждения: ...
 * Другие метки: ...
 *
 * При отсутствии разделов использует общий список tags.
 */
function annotationTagSections(tagSections, fallbackTags) {
    if (Array.isArray(tagSections) && tagSections.length) {
        const sections = tagSections
            .filter(section =>
                section?.label &&
                Array.isArray(section.tags) &&
                section.tags.length
            )
            .map(section => {
                const label = escapeXml(section.label);
                const values = escapeXml(section.tags.join(", "));

                return `<p><strong>${label}:</strong> ${values}</p>`;
            });

        if (sections.length) {
            return sections.join("");
        }
    }

    return fallbackTags
        ? `<p><strong>Метки:</strong> ${escapeXml(fallbackTags)}</p>`
        : "";
}

function buildFb2Header({ meta, cover, bookId }) {
    const {
        title,
        mainAuthor,
        coauthors,
        originalAuthor,
        originalWork,
        translators,
        betas,
        gammas,
        direction,
        rating,
        size,
        status,
        tags,
        tagSections,
        description,
        notes,
        otherPublication,
        fandom,
        pairings,
        series,
        sourceUrl
    } = meta;

    const today = new Date();
    const isoDate = today.toISOString().split("T")[0];

    return `<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:xlink="http://www.w3.org/1999/xlink">
    <description>
        <title-info>
            <genre>prose_contemporary</genre>
            ${personXml(mainAuthor)}
            ${(coauthors || []).map(personXml).join("\n")}
            <book-title>${escapeXml(title)}</book-title>
            <annotation>
                ${sourceUrl
        ? `<p><strong>Ссылка на работу:</strong> ${externalLinkXml(sourceUrl)}</p>`
        : ""}
                ${direction
        ? `<p><strong>Направленность:</strong> ${escapeXml(direction)}</p>`
        : ""}
                ${mainAuthor
        ? `<p><strong>Автор:</strong> ${escapeXml(mainAuthor.name)}${mainAuthor.url
            ? ` (${escapeXml(mainAuthor.url)})`
            : ""}</p>`
        : ""}
                ${originalAuthor && originalAuthor.name !== mainAuthor?.name
        ? `<p><strong>Автор оригинала:</strong> ${escapeXml(originalAuthor.name)}${originalAuthor.url
            ? ` (${escapeXml(originalAuthor.url)})`
            : ""}</p>`
        : ""}
                ${originalWork?.url
        ? `<p><strong>Оригинал:</strong> ${escapeXml(originalWork.url)}</p>`
        : ""}
                ${annotationPerson("Переводчик", translators)}
                ${annotationPerson("Соавторы", coauthors)}
                ${annotationPerson("Бета", betas)}
                ${annotationPerson("Гамма", gammas)}
                ${series
        ? `<p><strong>Серия:</strong> ${escapeXml(series.name)}${series.url
            ? ` (${escapeXml(series.url)})`
            : ""}</p>`
        : ""}
                ${fandom
        ? `<p><strong>Фэндом:</strong> ${escapeXml(fandom)}</p>`
        : ""}
                ${pairings?.length
        ? `<p><strong>Пейринги и персонажи:</strong> ${escapeXml(pairings.join(", "))}</p>`
        : ""}
                ${rating
        ? `<p><strong>Рейтинг:</strong> ${escapeXml(rating)}</p>`
        : ""}
                ${size
        ? `<p><strong>Размер:</strong> ${escapeXml(size)} слов</p>`
        : ""}
                ${status
        ? `<p><strong>Статус:</strong> ${escapeXml(status)}</p>`
        : ""}
                ${annotationTagSections(tagSections, tags)}
                ${description
        ? `<p><strong>Описание:</strong></p>${textToParagraphs(description)}`
        : ""}
                ${notes
        ? `<p><strong>Примечания:</strong></p>${textToParagraphs(notes)}`
        : ""}
                ${otherPublication
        ? `<p><strong>Публикация на других ресурсах:</strong> ${escapeXml(otherPublication)}</p>`
        : ""}
            </annotation>
            ${tags ? `<keywords>${escapeXml(tags)}</keywords>` : ""}
            <date value="${isoDate}">${today.toLocaleDateString("ru-RU")}</date>
            ${cover
        ? `<coverpage><image xlink:href="#${cover.fileName}"/></coverpage>`
        : ""}
            <lang>ru</lang>
            ${series?.name
        ? `<sequence name="${escapeXml(series.name)}"/>`
        : ""}
        </title-info>
        <document-info>
            <author>
                <nickname>Ficbook Exporter</nickname>
            </author>
            <program-used>Ficbook Exporter</program-used>
            <date value="${today.toISOString()}">${today.toLocaleString("ru-RU")}</date>
            <src-url>${escapeXml(sourceUrl)}</src-url>
            <id>${escapeXml(bookId)}</id>
            <version>2.0</version>
        </document-info>
    </description>
`;
}
;// ./src/fb2/fb2Toc.js


function buildFb2Toc(tocEntries) {
    return `
<body name="toc">
    <section>
        <title><p>Оглавление</p></title>
        ${tocEntries.map(ch => `<p><a xlink:href="#${escapeXml(ch.id)}">${escapeXml(ch.title)}</a></p>`).join("\n")}
    </section>
</body>
`;
}

;// ./src/fb2/fb2Body.js
function buildFb2Body(fb2Chapters) {
    return `
<body>
${fb2Chapters}
</body>
`;
}

;// ./src/fb2/fb2Builder.js









function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderFb2Footnotes(chapter, globalIndexRef) {
    let content = chapter.xhtml;
    const notes = [];

    for (const note of chapter.footnotes || []) {
        const number = globalIndexRef.value++;
        const targetId = `note_${chapter.number}_${note.id}`;
        const refPattern = new RegExp(
            `<footnote-ref[^>]*id=["']${escapeRegExp(note.id)}["'][^>]*>(?:<\\/footnote-ref>)?`,
            "g"
        );
        content = content.replace(refPattern, `<a xlink:href="#${escapeXml(targetId)}" type="note">[${number}]</a>`);
        notes.push({ id: targetId, number, html: note.html });
    }

    content = content.replace(/<\/?footnote-ref[^>]*>/g, "");
    return { content, notes };
}

async function createFB2(onProgress = () => {}, isCancelled = () => false) {
    const book = await collectBook(onProgress, isCancelled);
    const { meta, cover, chapters } = book;
    const bookId = createBookId();
    const globalFootnoteIndex = { value: 1 };
    const allNotes = [];
    const tocEntries = [];
    let chapterXml = "";

    for (const chapter of chapters) {
        const rendered = renderFb2Footnotes(chapter, globalFootnoteIndex);
        allNotes.push(...rendered.notes);
        const title = `${chapter.number}. ${chapter.title}`;
        tocEntries.push({ id: `ch${chapter.number}`, title });
        chapterXml += `
<section id="ch${chapter.number}">
    <title><p>${escapeXml(title)}</p></title>
    ${rendered.content}
</section>`;
    }

    const notesBody = allNotes.length ? `
<body name="notes">
${allNotes.map(note => `
<section id="${escapeXml(note.id)}">
    <title><p>${note.number}</p></title>
    <p>${note.html}</p>
</section>`).join("\n")}
</body>` : "";

    const coverBinary = cover
        ? `\n<binary id="${cover.fileName}" content-type="${cover.mediaType}">${cover.base64}</binary>`
        : "";

    const fullFb2 = [
        buildFb2Header({ meta, cover, bookId }),
        buildFb2Toc(tocEntries),
        buildFb2Body(chapterXml),
        notesBody,
        coverBinary,
        "\n</FictionBook>"
    ].join("");


    const translator = meta.translators?.[0]?.name;
    const titlePart = translator ? `${meta.title}_[${translator}]` : meta.title;
    const fileName = `${generateFileBaseName(meta.mainAuthor?.name || "UnknownAuthor", titlePart)}.fb2`;
    downloadBlob(new Blob([fullFb2], { type: "application/x-fictionbook+xml;charset=utf-8" }), fileName);
}

;// ./src/utils/loadLibrary.js
const pendingLoads = new Map();

function requestText(url) {
    const gmRequest = globalThis.GM_xmlhttpRequest || globalThis.GM?.xmlHttpRequest;
    if (gmRequest) {
        return new Promise((resolve, reject) => {
            gmRequest({
                method: "GET",
                url,
                responseType: "text",
                timeout: 30000,
                onload: response => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(response.responseText || response.response);
                    } else {
                        reject(new Error(`HTTP ${response.status}: ${url}`));
                    }
                },
                onerror: () => reject(new Error(`Не удалось загрузить библиотеку: ${url}`)),
                ontimeout: () => reject(new Error(`Тайм-аут загрузки библиотеки: ${url}`))
            });
        });
    }

    return fetch(url).then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
        return response.text();
    });
}

function findGlobal(globalName) {
    if (!globalName) return undefined;

    const roots = [
        globalThis,
        typeof window !== "undefined" ? window : undefined,
        typeof unsafeWindow !== "undefined" ? unsafeWindow : undefined
    ];

    for (const root of roots) {
        if (root && root[globalName]) return root[globalName];
    }
    return undefined;
}

function meaningfulExport(value) {
    if (!value) return undefined;
    if (typeof value === "function") return value;
    if (typeof value !== "object") return value;
    if (value.default) return value.default;
    if (Object.keys(value).length) return value;
    return undefined;
}

/**
 * Выполняет браузерную UMD-сборку как CommonJS-модуль.
 * Это важно для Tampermonkey: обычный indirect eval может выполнить код в
 * другом global scope, из-за чего window.JSZip/pdfMake не видны userscript.
 */
function executeUmd(source, url, globalName) {
    const module = { exports: {} };
    const exports = module.exports;
    const setImmediateShim = typeof globalThis.setImmediate === "function"
        ? globalThis.setImmediate.bind(globalThis)
        : (callback, ...args) => setTimeout(callback, 0, ...args);
    const clearImmediateShim = typeof globalThis.clearImmediate === "function"
        ? globalThis.clearImmediate.bind(globalThis)
        : handle => clearTimeout(handle);

    // JSZip использует setImmediate в одной из веток UMD/CommonJS.
    // В браузерном sandbox Tampermonkey этого API может не быть.
    try {
        if (typeof globalThis.setImmediate !== "function") globalThis.setImmediate = setImmediateShim;
        if (typeof globalThis.clearImmediate !== "function") globalThis.clearImmediate = clearImmediateShim;
    } catch (_) {
        // Даже если запись в globalThis запрещена, параметры runner остаются доступны модулю.
    }

    const runner = new Function(
        "module",
        "exports",
        "define",
        "require",
        "global",
        "window",
        "self",
        "setImmediate",
        "clearImmediate",
        `${source}\n//# sourceURL=${url}`
    );

    runner.call(
        globalThis,
        module,
        exports,
        undefined,
        undefined,
        globalThis,
        globalThis,
        globalThis,
        setImmediateShim,
        clearImmediateShim
    );

    const exported = meaningfulExport(module.exports);
    const existing = findGlobal(globalName);
    const library = existing || exported;

    if (globalName && library && !globalThis[globalName]) {
        try {
            globalThis[globalName] = library;
        } catch (_) {
            // Достаточно вернуть объект напрямую, если sandbox запрещает запись.
        }
    }

    return findGlobal(globalName) || library || true;
}

async function loadOne(url, globalName) {
    const existing = findGlobal(globalName);
    if (existing) return existing;

    if (!pendingLoads.has(url)) {
        pendingLoads.set(url, (async () => {
            const source = await requestText(url);
            return executeUmd(source, url, globalName);
        })());
    }

    try {
        const result = await pendingLoads.get(url);
        if (globalName && !findGlobal(globalName) && !result) {
            throw new Error(`Библиотека загружена, но объект ${globalName} не появился.`);
        }
        return findGlobal(globalName) || result;
    } catch (error) {
        pendingLoads.delete(url);
        throw error;
    }
}

/**
 * Лениво загружает внешний UMD-скрипт в userscript sandbox.
 * Можно передать несколько CDN-адресов: следующий используется при ошибке.
 */
async function loadExternalScript(urlOrUrls, globalName = "") {
    const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
    const errors = [];

    for (const url of urls) {
        try {
            return await loadOne(url, globalName);
        } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error));
        }
    }

    throw new Error(`Не удалось загрузить внешнюю библиотеку:\n${errors.join("\n")}`);
}

;// ./src/epub/epubCss.js
const epubCss = `
body {
    margin: 0;
    padding: 0 8%;
    font-family: serif;
    line-height: 1.55;
    font-size: 1em;
}
h1, h2, h3 {
    font-weight: 700;
    margin: 1.2em 0 0.6em; 
    }
h1 {
    font-size: 1.55em;
    text-align: center;
    }
p {
    margin: 0.6em 0;
    }
.title-page {
    text-align: center; 
    }
.title-page .cover {
    display: block; max-width: 90%;
    max-height: 80vh;
    margin: 0 auto 1.5em;
    }
.title-page h1 {
    font-size: 1.8em;
    margin-bottom: 0.4em;
    }
.title-page h2 {
    font-size: 1.2em; margin-top: 0;
    }
.meta-block {
    margin-top: 2em;
    font-size: 0.9em;
    text-align: left;
    }
.meta-block p {
    margin: 0.2em 0;
    }
.footnotes {
    margin-top: 2em;
    border-top: 1px solid #999;
    font-size: 0.9em;
    }
.footnote-ref {
    text-decoration: none;
    vertical-align: super;
    font-size: 0.8em;
    }
`;

;// ./src/epub/epubTemplates.js



function peopleLine(label, people) {
    if (!people?.length) return "";

    const value = people
        .map(person =>
            person.url
                ? `${escapeXml(person.name)} (${escapeXml(person.url)})`
                : escapeXml(person.name)
        )
        .join(", ");

    return `<p><strong>${escapeXml(label)}:</strong> ${value}</p>`;
}

function externalLink(url, label = url) {
    if (!url) return "";

    return `<a href="${escapeXml(url)}">${escapeXml(label)}</a>`;
}

/**
 * Формирует отдельные строки для разделов меток Ficbook:
 *
 * Предупреждения: ...
 * Другие метки: ...
 *
 * Если разделы отсутствуют, использует общий список tags.
 */
function tagSectionLines(tagSections, fallbackTags) {
    if (Array.isArray(tagSections) && tagSections.length) {
        return tagSections
            .filter(section =>
                section?.label &&
                Array.isArray(section.tags) &&
                section.tags.length
            )
            .map(section => {
                const label = escapeXml(section.label);
                const values = escapeXml(section.tags.join(", "));

                return `<p><strong>${label}:</strong> ${values}</p>`;
            })
            .join("");
    }

    return fallbackTags
        ? `<p><strong>Метки:</strong> ${escapeXml(fallbackTags)}</p>`
        : "";
}

function buildTitlePage({ meta, cover }) {
    const {
        title,
        mainAuthor,
        coauthors,
        translators,
        betas,
        gammas,
        direction,
        rating,
        size,
        status,
        tags,
        tagSections,
        description,
        notes,
        otherPublication,
        fandom,
        pairings,
        series,
        sourceUrl
    } = meta;

    const xhtml = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ru">
<head>
    <title>${escapeXml(title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <div class="title-page">
        ${cover ? `<img class="cover" src="images/${cover.fileName}" alt="Обложка"/>` : ""}
        <h1>${escapeXml(title)}</h1>
        <h2>${escapeXml(mainAuthor?.name || "")}</h2>

        <div class="meta-block">
            ${sourceUrl
        ? `<p><strong>Ссылка на работу:</strong> ${externalLink(sourceUrl)}</p>`
        : ""}
            ${direction
        ? `<p><strong>Направленность:</strong> ${escapeXml(direction)}</p>`
        : ""}
            ${peopleLine("Переводчик", translators)}
            ${peopleLine("Соавторы", coauthors)}
            ${peopleLine("Бета", betas)}
            ${peopleLine("Гамма", gammas)}
            ${series
        ? `<p><strong>Серия:</strong> ${escapeXml(series.name)}${series.url
            ? ` (${escapeXml(series.url)})`
            : ""}</p>`
        : ""}
            ${fandom
        ? `<p><strong>Фэндом:</strong> ${escapeXml(fandom)}</p>`
        : ""}
            ${pairings?.length
        ? `<p><strong>Пейринги и персонажи:</strong> ${escapeXml(pairings.join(", "))}</p>`
        : ""}
            ${rating
        ? `<p><strong>Рейтинг:</strong> ${escapeXml(rating)}</p>`
        : ""}
            ${size
        ? `<p><strong>Размер:</strong> ${escapeXml(size)} слов</p>`
        : ""}
            ${status
        ? `<p><strong>Статус:</strong> ${escapeXml(status)}</p>`
        : ""}
            ${tagSectionLines(tagSections, tags)}
        </div>
    </div>

    ${description
        ? `<h2>Описание</h2>${textToParagraphs(description)}`
        : ""}
    ${notes
        ? `<h2>Примечания</h2>${textToParagraphs(notes)}`
        : ""}
    ${otherPublication
        ? `<h2>Публикация на других ресурсах</h2><p>${escapeXml(otherPublication)}</p>`
        : ""}
</body>
</html>`;

    return xhtml.replace(/^[ \t]*\r?\n/gm, "");
}

function buildChapterPage(chapter) {
    return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ru">
<head>
    <title>${escapeXml(chapter.title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>${escapeXml(`${chapter.number}. ${chapter.title}`)}</h1>
    ${chapter.content}
</body>
</html>`;
}

function buildTocXhtml(chapters) {
    const items = chapters
        .map(chapter =>
            `<li><a href="${escapeXml(chapter.file)}">${escapeXml(
                `${chapter.number}. ${chapter.title}`
            )}</a></li>`
        )
        .join("\n");

    return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ru">
<head>
    <title>Оглавление</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>Оглавление</h1>
    <ol>${items}</ol>
</body>
</html>`;
}
;// ./src/epub/epubOpf.js


function buildOpf({ meta, chapters, cover, bookId }) {
    const manifest = [
        `<item id="css" href="style.css" media-type="text/css"/>`,
        `<item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>`,
        `<item id="toc" href="toc.xhtml" media-type="application/xhtml+xml"/>`,
        ...chapters.map(chapter => `<item id="${chapter.id}" href="${chapter.file}" media-type="application/xhtml+xml"/>`),
        ...(cover ? [`<item id="cover-image" href="images/${cover.fileName}" media-type="${cover.mediaType}"/>`] : []),
        `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`
    ].join("\n        ");

    const spine = [
        `<itemref idref="titlepage"/>`,
        `<itemref idref="toc"/>`,
        ...chapters.map(chapter => `<itemref idref="${chapter.id}"/>`)
    ].join("\n        ");

    return `<?xml version="1.0" encoding="utf-8"?>
<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${escapeXml(meta.title)}</dc:title>
        <dc:creator>${escapeXml(meta.mainAuthor?.name || "UnknownAuthor")}</dc:creator>
        <dc:language>ru</dc:language>
        <dc:identifier id="BookId">urn:uuid:${escapeXml(bookId)}</dc:identifier>
        <dc:date>${new Date().toISOString().split("T")[0]}</dc:date>
        <dc:subject>${escapeXml(meta.tags || "fanfiction")}</dc:subject>
        <dc:description>${escapeXml((meta.description || "").slice(0, 1000))}</dc:description>
        <dc:source>${escapeXml(meta.sourceUrl)}</dc:source>
        ${cover ? `<meta name="cover" content="cover-image"/>` : ""}
    </metadata>
    <manifest>
        ${manifest}
    </manifest>
    <spine toc="ncx">
        ${spine}
    </spine>
    <guide>
        <reference type="cover" title="Обложка" href="titlepage.xhtml"/>
        <reference type="toc" title="Оглавление" href="toc.xhtml"/>
    </guide>
</package>`;
}

;// ./src/epub/epubNcx.js


function buildNcx(title, chapters, bookId) {
    const navPoints = chapters.map((chapter, index) => `
        <navPoint id="navPoint-${index + 2}" playOrder="${index + 2}">
            <navLabel><text>${escapeXml(`${chapter.number}. ${chapter.title}`)}</text></navLabel>
            <content src="${escapeXml(chapter.file)}"/>
        </navPoint>`).join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="urn:uuid:${escapeXml(bookId)}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle><text>${escapeXml(title)}</text></docTitle>
    <navMap>
        <navPoint id="navPoint-1" playOrder="1">
            <navLabel><text>Оглавление</text></navLabel>
            <content src="toc.xhtml"/>
        </navPoint>
        ${navPoints}
    </navMap>
</ncx>`;
}

;// ./src/epub/epubBuilder.js











function epubBuilder_escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderEpubFootnotes(chapter) {
    let content = chapter.xhtml;
    const notes = [];

    for (const note of chapter.footnotes || []) {
        const id = `fn_${chapter.number}_${note.id}`;
        const pattern = new RegExp(
            `<footnote-ref[^>]*id=["']${epubBuilder_escapeRegExp(note.id)}["'][^>]*>(?:<\\/footnote-ref>)?`,
            "g"
        );
        content = content.replace(
            pattern,
            `<a href="#${escapeXml(id)}" epub:type="noteref" class="footnote-ref">[${note.number}]</a>`
        );
        notes.push({ id, number: note.number, html: note.html });
    }

    content = content.replace(/<\/?footnote-ref[^>]*>/g, "");
    if (!notes.length) return content;

    return `${content}
<div class="footnotes">
${notes.map(note => `<aside id="${escapeXml(note.id)}" epub:type="footnote"><p><sup>${note.number}</sup> ${note.html}</p></aside>`).join("\n")}
</div>`;
}

async function createEPUB(onProgress = () => {}, isCancelled = () => false) {
    const JSZip = await loadExternalScript(
        [
            "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
            "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"
        ],
        "JSZip"
    );

    const book = await collectBook(onProgress, isCancelled);
    const { meta, cover } = book;
    const chapters = book.chapters.map(chapter => ({
        ...chapter,
        id: `chapter${chapter.number}`,
        file: `chapter${chapter.number}.xhtml`,
        content: renderEpubFootnotes(chapter)
    }));
    const bookId = createBookId();
    const zip = new JSZip();

    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
    zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`);
    zip.file("OEBPS/style.css", epubCss.trim());
    zip.file("OEBPS/titlepage.xhtml", buildTitlePage({ meta, cover }));
    chapters.forEach(chapter => zip.file(`OEBPS/${chapter.file}`, buildChapterPage(chapter)));
    zip.file("OEBPS/toc.xhtml", buildTocXhtml(chapters));
    zip.file("OEBPS/content.opf", buildOpf({ meta, chapters, cover, bookId }));
    zip.file("OEBPS/toc.ncx", buildNcx(meta.title, chapters, bookId));
    if (cover) zip.file(`OEBPS/images/${cover.fileName}`, cover.bytes, { binary: true });

    const blob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/epub+zip",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
    });


    const translator = meta.translators?.[0]?.name;
    const titlePart = translator ? `${meta.title}_[${translator}]` : meta.title;
    const fileName = `${generateFileBaseName(meta.mainAuthor?.name || "UnknownAuthor", titlePart)}.epub`;
    downloadBlob(blob, fileName);
}

;// ./src/txt/txtBuilder.js




function addLine(lines, label, value) {
    if (
        !value ||
        (Array.isArray(value) && !value.length)
    ) {
        return;
    }

    const text = Array.isArray(value)
        ? value.join(", ")
        : value;

    lines.push(`${label}: ${text}`);
}

function addTagSections(lines, meta) {
    const tagSections = Array.isArray(meta.tagSections)
        ? meta.tagSections.filter(section =>
            section?.label &&
            Array.isArray(section.tags) &&
            section.tags.length
        )
        : [];

    /*
     * Выводим метки по разделам Ficbook:
     *
     * Предупреждения: ...
     * Другие метки: ...
     */
    if (tagSections.length) {
        tagSections.forEach(section => {
            addLine(
                lines,
                section.label,
                section.tags
            );
        });

        return;
    }

    /*
     * Резервный вариант для старых данных,
     * в которых tagSections ещё отсутствует.
     */
    addLine(lines, "Метки", meta.tags);
}

function buildHeader(meta) {
    const lines = [
        meta.title,
        meta.mainAuthor?.name || "Неизвестный автор",
        ""
    ];

    addLine(lines, "Ссылка", meta.sourceUrl);
    addLine(lines, "Направленность", meta.direction);
    addLine(lines, "Рейтинг", meta.rating);
    addLine(lines, "Статус", meta.status);

    addLine(
        lines,
        "Размер",
        meta.size
            ? `${meta.size} слов`
            : ""
    );

    addLine(lines, "Фэндом", meta.fandom);

    addLine(
        lines,
        "Пейринги и персонажи",
        meta.pairings
    );

    addTagSections(lines, meta);

    addLine(
        lines,
        "Серия",
        meta.series?.name
    );

    addLine(
        lines,
        "Соавторы",
        meta.coauthors?.map(author => author.name)
    );

    addLine(
        lines,
        "Переводчики",
        meta.translators?.map(author => author.name)
    );

    addLine(
        lines,
        "Бета",
        meta.betas?.map(author => author.name)
    );

    addLine(
        lines,
        "Гамма",
        meta.gammas?.map(author => author.name)
    );

    addLine(
        lines,
        "Автор оригинала",
        meta.originalAuthor?.name
    );

    addLine(
        lines,
        "Оригинал",
        meta.originalWork?.url
    );

    if (meta.description) {
        lines.push(
            "",
            "Описание",
            meta.description
        );
    }

    if (meta.notes) {
        lines.push(
            "",
            "Примечания автора",
            meta.notes
        );
    }

    if (meta.otherPublication) {
        lines.push(
            "",
            "Публикация на других ресурсах",
            meta.otherPublication
        );
    }

    return lines.join("\n");
}

async function createTXT(
    onProgress = () => {},
    isCancelled = () => false
) {
    const { meta, chapters } = await collectBook(
        onProgress,
        isCancelled
    );

    const parts = [
        buildHeader(meta),
        "",
        "=".repeat(72)
    ];

    for (const chapter of chapters) {
        parts.push(
            "",
            `${chapter.number}. ${chapter.title}`,
            "-".repeat(72),
            "",
            chapter.plain
        );

        if (chapter.footnotes?.length) {
            parts.push("", "Сноски:");

            chapter.footnotes.forEach(note => {
                parts.push(
                    `[${note.number}] ${note.text}`
                );
            });
        }
    }

    const translator =
        meta.translators?.[0]?.name;

    const titlePart = translator
        ? `${meta.title}_[${translator}]`
        : meta.title;

    const fileName =
        `${generateFileBaseName(
            meta.mainAuthor?.name || "UnknownAuthor",
            titlePart
        )}.txt`;

    downloadBlob(
        new Blob(
            [
                "\ufeff",
                parts.join("\n")
            ],
            {
                type: "text/plain;charset=utf-8"
            }
        ),
        fileName
    );
}
;// ./src/pdf/pdfBuilder.js





function linkFragment(url, label = url) {
    if (!url) {
        return {
            text: label || ""
        };
    }

    return {
        text: label || url,
        link: url,
        decoration: "underline",
        color: "#0645ad"
    };
}

function linkedValue(label, url) {
    if (!label && !url) return [];

    if (!url) {
        return [
            {
                text: label || ""
            }
        ];
    }

    return [
        {
            text: label || url
        },
        {
            text: " ("
        },
        linkFragment(url),
        {
            text: ")"
        }
    ];
}

function peopleValue(people) {
    const fragments = [];

    (people || []).forEach((person, index) => {
        if (index) {
            fragments.push({
                text: ", "
            });
        }

        fragments.push(
            ...linkedValue(person.name, person.url)
        );
    });

    return fragments;
}

function plainValue(value) {
    if (Array.isArray(value)) {
        return [
            {
                text: value.join(", ")
            }
        ];
    }

    return [
        {
            text: String(value ?? "")
        }
    ];
}

function metaRows(meta) {
    const rows = [];

    const add = (label, fragments) => {
        if (
            !fragments?.length ||
            fragments.every(fragment =>
                !String(fragment.text || "").trim()
            )
        ) {
            return;
        }

        rows.push({
            text: [
                {
                    text: `${label}: `,
                    bold: true
                },
                ...fragments
            ],
            margin: [0, 1, 0, 1]
        });
    };

    add(
        "Ссылка",
        meta.sourceUrl
            ? [linkFragment(meta.sourceUrl)]
            : []
    );

    add(
        "Направленность",
        meta.direction
            ? plainValue(meta.direction)
            : []
    );

    add(
        "Рейтинг",
        meta.rating
            ? plainValue(meta.rating)
            : []
    );

    add(
        "Статус",
        meta.status
            ? plainValue(meta.status)
            : []
    );

    add(
        "Размер",
        meta.size
            ? plainValue(`${meta.size} слов`)
            : []
    );

    add(
        "Фэндом",
        meta.fandom
            ? plainValue(meta.fandom)
            : []
    );

    add(
        "Пейринги и персонажи",
        meta.pairings?.length
            ? plainValue(meta.pairings)
            : []
    );

    /*
     * Выводим каждый раздел меток отдельно:
     *
     * Предупреждения: ...
     * Другие метки: ...
     *
     * Для старых данных без tagSections используется общий meta.tags.
     */
    const tagSections = Array.isArray(meta.tagSections)
        ? meta.tagSections.filter(section =>
            section?.label &&
            Array.isArray(section.tags) &&
            section.tags.length
        )
        : [];

    if (tagSections.length) {
        tagSections.forEach(section => {
            add(
                section.label,
                plainValue(section.tags)
            );
        });
    } else {
        add(
            "Метки",
            meta.tags
                ? plainValue(meta.tags)
                : []
        );
    }

    add(
        "Серия",
        meta.series
            ? linkedValue(
            meta.series.name,
            meta.series.url
            )
            : []
    );

    add(
        "Соавторы",
        peopleValue(meta.coauthors)
    );

    add(
        "Переводчики",
        peopleValue(meta.translators)
    );

    add(
        "Бета",
        peopleValue(meta.betas)
    );

    add(
        "Гамма",
        peopleValue(meta.gammas)
    );

    add(
        "Автор оригинала",
        meta.originalAuthor
            ? linkedValue(
            meta.originalAuthor.name,
            meta.originalAuthor.url
            )
            : []
    );

    add(
        "Оригинал",
        meta.originalWork?.url
            ? [linkFragment(meta.originalWork.url)]
            : []
    );

    return rows;
}

function paragraphNodes(text) {
    return String(text || "")
        .split(/\n{2,}/)
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => ({
            text: part,
            style: "body",
            margin: [0, 0, 0, 7]
        }));
}

function getPdfBlob(pdfMake, definition) {
    return new Promise((resolve, reject) => {
        try {
            pdfMake
                .createPdf(definition)
                .getBlob(resolve);
        } catch (error) {
            reject(error);
        }
    });
}

function buildPdfDefinition({
                                       meta,
                                       cover,
                                       chapters
                                   }) {
    const content = [];

    if (cover) {
        content.push({
            image: cover.dataUrl,
            fit: [360, 500],
            alignment: "center",
            margin: [0, 0, 0, 18]
        });
    }

    content.push({
        text: meta.title,
        style: "title"
    });

    content.push({
        text: linkedValue(
            meta.mainAuthor?.name || "Неизвестный автор",
            meta.mainAuthor?.url
        ),
        style: "author"
    });

    content.push(...metaRows(meta));

    if (meta.description) {
        content.push(
            {
                text: "Описание",
                style: "section"
            },
            ...paragraphNodes(meta.description)
        );
    }

    if (meta.notes) {
        content.push(
            {
                text: "Примечания автора",
                style: "section"
            },
            ...paragraphNodes(meta.notes)
        );
    }

    if (meta.otherPublication) {
        content.push(
            {
                text: "Публикация на других ресурсах",
                style: "section"
            },
            ...paragraphNodes(meta.otherPublication)
        );
    }

    if (chapters.length) {
        content.push({
            toc: {
                id: "chaptersToc",
                title: {
                    text: "Оглавление",
                    style: "tocTitle"
                },
                textStyle: "tocEntry",
                numberStyle: "tocPageNumber"
            },
            pageBreak: "before"
        });
    }

    chapters.forEach((chapter, index) => {
        const destinationId = `chapter-${index + 1}`;

        content.push({
            text: `${chapter.number}. ${chapter.title}`,
            style: "chapter",
            id: destinationId,
            tocItem: "chaptersToc",
            pageBreak: "before"
        });

        content.push(
            ...paragraphNodes(chapter.plain)
        );

        if (chapter.footnotes?.length) {
            content.push({
                text: "Сноски",
                style: "footnoteHeading"
            });

            chapter.footnotes.forEach(note => {
                content.push({
                    text: `[${note.number}] ${note.text}`,
                    style: "footnote"
                });
            });
        }
    });

    return {
        info: {
            title: meta.title,
            author:
                meta.mainAuthor?.name ||
                "UnknownAuthor",
            subject:
                meta.fandom ||
                "fanfiction",

            /*
             * В служебных метаданных PDF оставляем
             * общий список всех меток.
             */
            keywords: meta.tags || ""
        },

        pageSize: "A4",
        pageMargins: [54, 54, 54, 58],

        defaultStyle: {
            font: "Roboto",
            fontSize: 11,
            lineHeight: 1.25
        },

        styles: {
            title: {
                fontSize: 22,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 8]
            },

            author: {
                fontSize: 14,
                alignment: "center",
                margin: [0, 0, 0, 18]
            },

            section: {
                fontSize: 15,
                bold: true,
                margin: [0, 16, 0, 8]
            },

            tocTitle: {
                fontSize: 20,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 18]
            },

            tocEntry: {
                fontSize: 11,
                margin: [0, 3, 0, 3]
            },

            tocPageNumber: {
                fontSize: 10,
                bold: true
            },

            chapter: {
                fontSize: 17,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 18]
            },

            body: {
                fontSize: 11,
                alignment: "justify"
            },

            footnoteHeading: {
                fontSize: 11,
                bold: true,
                margin: [0, 12, 0, 5]
            },

            footnote: {
                fontSize: 9,
                margin: [0, 0, 0, 4]
            }
        },

        footer: (currentPage, pageCount) => ({
            text: `${currentPage} / ${pageCount}`,
            alignment: "center",
            fontSize: 8,
            margin: [0, 15, 0, 0]
        }),

        content
    };
}

async function createPDF(
    onProgress = () => {},
    isCancelled = () => false
) {
    const pdfMake = await loadExternalScript(
        [
            "https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/pdfmake.min.js",
            "https://unpkg.com/pdfmake@0.2.20/build/pdfmake.min.js"
        ],
        "pdfMake"
    );

    const pdfFonts = await loadExternalScript([
        "https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/vfs_fonts.js",
        "https://unpkg.com/pdfmake@0.2.20/build/vfs_fonts.js"
    ]);

    if (
        pdfFonts &&
        pdfFonts !== true &&
        typeof pdfMake.addVirtualFileSystem === "function"
    ) {
        pdfMake.addVirtualFileSystem(
            pdfFonts.default || pdfFonts
        );
    }

    const book = await collectBook(
        onProgress,
        isCancelled
    );

    const { meta } = book;
    const definition = buildPdfDefinition(book);
    const blob = await getPdfBlob(
        pdfMake,
        definition
    );

    const translator =
        meta.translators?.[0]?.name;

    const titlePart = translator
        ? `${meta.title}_[${translator}]`
        : meta.title;

    const fileName =
        `${generateFileBaseName(
            meta.mainAuthor?.name || "UnknownAuthor",
            titlePart
        )}.pdf`;

    downloadBlob(blob, fileName);
}
;// ./src/ui/buttons.js
/**
 * Встраивает компактную кнопку экспорта в штатную панель действий Ficbook.
 * Список форматов открывается рядом с кнопкой и не зависит от плавающих кнопок сайта.
 */
function createButtons(exporters) {
    const cleanupKey = "__ficbookExporterUiCleanup";
    if (typeof window[cleanupKey] === "function") window[cleanupKey]();

    // Удаляем интерфейс предыдущей версии, если скрипт был обновлён без перезагрузки страницы.
    document.querySelectorAll("#ficbook-export-buttons").forEach(element => element.remove());
    document.querySelector("#ficbook-export-ui-style")?.remove();

    const actionsContainer = document.querySelector(
        "section.chapter-info .hat-actions-container, .hat-actions-container"
    );
    if (!actionsContainer) return false;

    /**
     * Ищет основную строку действий Ficbook — ту, где находятся лайки,
     * отметки, комментарии и награды.
     */
    function findPlacement() {
        const currentContainer = document.querySelector(
            "section.chapter-info .hat-actions-container, .hat-actions-container"
        );
        if (!currentContainer) return null;

        const directRows = Array.from(currentContainer.children).filter(element =>
            element.matches?.(".d-flex.flex-wrap")
        );
        const rows = directRows.length
            ? directRows
            : Array.from(currentContainer.querySelectorAll(".d-flex.flex-wrap"));

        const primaryActionsRow = rows.find(row =>
            row.querySelector(
                ".ds-btn-primary, .js-marks-plus, .js-reward-count, " +
                "a[href*='/comments'], .ic_thumbs-up, .ic-star-empty, .ic_star-empty"
            ) &&
            !row.querySelector("a[href*='/collections/'], .button-container")
        );

        const fallbackRow = primaryActionsRow ||
            directRows[0] ||
            currentContainer.querySelector(".d-flex.flex-wrap") ||
            currentContainer.querySelector(".d-flex") ||
            currentContainer;

        return { row: fallbackRow };
    }

    const style = document.createElement("style");
    style.id = "ficbook-export-ui-style";
    style.textContent = `
#ficbook-export-buttons {
    position: relative;
    display: inline-flex;
    flex: 0 0 auto;
    z-index: 60;
    font-family: inherit;
}
#ficbook-export-buttons *,
#ficbook-export-buttons *::before,
#ficbook-export-buttons *::after {
    box-sizing: border-box;
}
.fbe-inline-trigger {
    width: 148px;
    min-width: 148px;
    max-width: 148px;
    justify-content: center;
    gap: 5px;
    overflow: hidden;
    white-space: nowrap;
    background: #4f86c6 !important;
    border: 1px solid #2f639d !important;
    color: #ffffff !important;
    font-weight: 700;
    transition: background-color .15s ease, border-color .15s ease;
}
.fbe-inline-trigger:hover,
.fbe-inline-trigger:focus-visible,
.fbe-inline-trigger[aria-expanded="true"] {
    background: #356da9 !important;
    border-color: #244f7c !important;
    color: #ffffff !important;
}
.fbe-inline-trigger-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}
.fbe-inline-trigger.is-busy {
    cursor: pointer;
}
.fbe-inline-trigger-chevron {
    margin-left: 1px;
    font-size: 9px;
    line-height: 1;
    opacity: .8;
    transition: transform .15s ease;
}
.fbe-inline-trigger[aria-expanded="true"] .fbe-inline-trigger-chevron {
    transform: rotate(180deg);
}
.fbe-inline-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    display: none;
    min-width: 154px;
    padding: 5px;
    border: 1px solid rgba(64, 48, 35, .18);
    border-radius: 8px;
    background: #fffaf3;
    box-shadow: 0 8px 22px rgba(45, 31, 22, .2);
    z-index: 10020;
}
.fbe-inline-menu.is-open {
    display: grid;
    gap: 3px;
}
.fbe-inline-menu-item {
    display: block;
    width: 100%;
    min-height: 34px;
    padding: 7px 10px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #3f2d21;
    cursor: pointer;
    font: inherit;
    font-size: 14px;
    line-height: 1.2;
    text-align: left;
    white-space: nowrap;
}
.fbe-inline-menu-item:hover,
.fbe-inline-menu-item:focus-visible {
    background: rgba(122, 87, 52, .12);
    outline: none;
}
body.dark-theme .fbe-inline-menu {
    border-color: rgba(255, 255, 255, .14);
    background: #2d2723;
    box-shadow: 0 8px 22px rgba(0, 0, 0, .42);
}
body.dark-theme .fbe-inline-menu-item {
    color: #f4ece5;
}
body.dark-theme .fbe-inline-menu-item:hover,
body.dark-theme .fbe-inline-menu-item:focus-visible {
    background: rgba(255, 255, 255, .09);
}

@media (max-width: 767px) {
    .hat-actions-container > .d-flex.flex-wrap.justify-content-center {
        justify-content: flex-start !important;
        width: 100%;
    }
}

@media (max-width: 520px) {
    .fbe-inline-menu {
        left: auto;
        right: 0;
    }
}
`;

    document.querySelector(`#${style.id}`)?.remove();
    document.head.appendChild(style);

    const wrapper = document.createElement("div");
    wrapper.id = "ficbook-export-buttons";

    const menu = document.createElement("div");
    menu.className = "fbe-inline-menu";
    menu.id = "ficbook-export-format-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Выберите формат файла");

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "ds-btn ds-btn-regular ds-btn-mini fbe-inline-trigger";
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-controls", menu.id);
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = `
<span class="fbe-inline-trigger-label">Скачать</span>
<span class="fbe-inline-trigger-chevron" aria-hidden="true">▼</span>`;

    const triggerLabel = trigger.querySelector(".fbe-inline-trigger-label");
    const triggerChevron = trigger.querySelector(".fbe-inline-trigger-chevron");
    let activeDownload = null;

    const configs = [
        { format: "FB2", start: exporters.fb2 },
        { format: "EPUB", start: exporters.epub },
        { format: "PDF", start: exporters.pdf },
        { format: "TXT", start: exporters.txt }
    ];

    function closeMenu() {
        menu.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
        if (activeDownload) return;
        menu.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        menu.querySelector(".fbe-inline-menu-item")?.focus();
    }

    function resetTrigger() {
        trigger.classList.remove("is-busy");
        triggerLabel.textContent = "Скачать";
        triggerChevron.textContent = "▼";
        trigger.title = "Выбрать формат файла";
    }

    function cancelActiveDownload() {
        if (!activeDownload || activeDownload.stopping) return;
        activeDownload.stopping = true;
        activeDownload.cancelled = true;
        triggerLabel.textContent = "Остановка…";
        triggerChevron.textContent = "";
    }

    async function runDownload(config) {
        if (activeDownload) return;
        closeMenu();

        const state = { cancelled: false, stopping: false, format: config.format };
        activeDownload = state;
        trigger.classList.add("is-busy");
        triggerLabel.textContent = `Подготовка ${config.format}`;
        triggerChevron.textContent = "×";
        trigger.title = `Остановить экспорт ${config.format}`;

        try {
            await config.start(
                (current, total) => {
                    if (state.cancelled) throw new Error("cancelled");
                    triggerLabel.textContent = `${config.format} ${current}/${total}`;
                },
                () => state.cancelled
            );
        } catch (error) {
            if (error?.message !== "cancelled") {
                console.error(`Ошибка экспорта ${config.format}:`, error);
                alert(`Не удалось создать файл ${config.format}:\n${error?.message || error}`);
            }
        } finally {
            if (activeDownload === state) activeDownload = null;
            resetTrigger();
        }
    }

    configs.forEach(config => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "fbe-inline-menu-item";
        item.setAttribute("role", "menuitem");
        item.textContent = `Скачать ${config.format}`;
        item.addEventListener("click", event => {
            event.stopPropagation();
            runDownload(config);
        });
        menu.appendChild(item);
    });

    trigger.addEventListener("click", event => {
        event.stopPropagation();
        if (activeDownload) {
            cancelActiveDownload();
            return;
        }
        if (menu.classList.contains("is-open")) closeMenu();
        else openMenu();
    });

    function onDocumentClick(event) {
        if (!wrapper.contains(event.target)) closeMenu();
    }

    function onKeyDown(event) {
        if (event.key === "Escape") {
            closeMenu();
            trigger.focus();
        }
    }

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);

    wrapper.append(menu, trigger);

    /**
     * Ставит кнопку в основную строку действий вместе с лайками,
     * комментариями и наградами. Если Ficbook пересоздал панель,
     * кнопка автоматически возвращается в новый контейнер.
     */
    function insertWrapper() {
        const placement = findPlacement();
        if (!placement?.row) return false;

        const { row } = placement;
        if (wrapper.parentElement !== row) {
            row.appendChild(wrapper);
        }
        return true;
    }

    insertWrapper();
    resetTrigger();

    // Ficbook может дорисовывать или полностью пересоздавать панель действий.
    // Наблюдатель с небольшой задержкой возвращает кнопку на правильное место.
    let reinjectTimer = null;
    const placementObserver = new MutationObserver(() => {
        if (reinjectTimer !== null) return;
        reinjectTimer = window.setTimeout(() => {
            reinjectTimer = null;
            insertWrapper();
        }, 150);
    });
    placementObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    window[cleanupKey] = () => {
        document.removeEventListener("click", onDocumentClick);
        document.removeEventListener("keydown", onKeyDown);
        placementObserver.disconnect();
        if (reinjectTimer !== null) window.clearTimeout(reinjectTimer);
        wrapper.remove();
        style.remove();
        delete window[cleanupKey];
    };

    return true;
}

;// ./src/main.js






const exporters = { fb2: createFB2, epub: createEPUB, txt: createTXT, pdf: createPDF };
let observer = null;
let insertionScheduled = false;

function insertButtons() {
    insertionScheduled = false;
    if (!document.body || document.querySelector("#ficbook-export-buttons .fbe-inline-trigger")) return;
    createButtons(exporters);
}

function scheduleInsert() {
    if (insertionScheduled) return;
    insertionScheduled = true;
    requestAnimationFrame(insertButtons);
}

function start() {
    insertButtons();
    if (observer || !document.body) return;
    observer = new MutationObserver(scheduleInsert);
    observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();

