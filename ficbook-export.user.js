// ==UserScript==
// @name           Ficbook Exporter — EPUB & FB2 Downloader
// @name:ru        Скачивание книг с фикбука в формате FB2 & EPUB
// @name:en        Ficbook Exporter — EPUB & FB2 Downloader
// @namespace      http://tampermonkey.net/
// @version        1.7.0
// @build          2026-06-17 07:05
// @description    Download books from Ficbook in FB2 & EPUB without registration or limits
// @description:ru Скрипт позволяет скачивать книги с Фикбука в форматах FB2 и EPUB без регистрации и ограничений
// @author         tsuki8neko
// @match          https://ficbook.net/readfic/*
// @grant          GM_xmlhttpRequest
// @license        Apache-2.0
// @updateURL      https://raw.githubusercontent.com/tsuki8neko/Ficbook-FB2-EPUB-Export/master/ficbook-export.user.js
// @downloadURL    https://raw.githubusercontent.com/tsuki8neko/Ficbook-FB2-EPUB-Export/master/ficbook-export.user.js
// ==/UserScript==


;// ./src/core/getTitle.js
// Извлекает название произведения

function getTitle() {
    return (
        document.querySelector("h1.heading[itemprop='name']")?.innerText.trim() ||
        document.querySelector("h1.heading[itemprop='headline']")?.innerText.trim() ||
        document.querySelector("h1.heading")?.innerText.trim() ||
        "Фанфик"
    );
}

;// ./src/core/getAuthors.js
/**
 * Извлекает список авторов и соавторов произведения.
 *
 * Роли бывают разными:
 * - автор
 * - бета
 * - гамма
 * - переводчик
 * - редактор
 *
 * Функция собирает все такие блоки и возвращает массив объектов.
 */

function getAuthors() {
    // Основной блок с информацией о фанфике ("шапка")
    const hat = document.querySelector(".fanfic-hat-body");
    // Внутри шапки находятся элементы .creator-info — каждый отвечает за одного участника
    const creators = hat.querySelectorAll(".creator-info");

    return Array.from(creators).map(c => {
        const nameNode = c.querySelector(".creator-username");
        // Узел с ролью (например: "Автор", "Бета", "Переводчик")
        const roleNode = c.querySelector(".small-text.text-muted");

        return {
            name: nameNode?.innerText.trim() || "",
            url: nameNode?.href || "",
            // Роль автора, приводим к нижнему регистру для единообразия
            role: roleNode?.innerText.trim().toLowerCase() || "автор"
        };
    });
}


;// ./src/core/getMeta.js
/**
 * Извлекает дополнительные метаданные произведения из шапки
 *
 * Возвращает:
 * - фэндом(ы)
 * - размер работы в словах
 * - теги
 * - описание
 * - примечания автора
 * - информацию о публикации на других ресурсах
 * - список пейрингов и персонажей
 */

function getExtraData() {

    // Ищет блок описания по тексту заголовка.
    const findBlock = (label) =>
        Array.from(document.querySelectorAll(".description .mb-10"))
            .find(n => n.querySelector("strong")?.innerText.includes(label));

    // --- ФЭНДОМ ---
    const fandomBlock = findBlock("Фэндом:");
    let fandom = fandomBlock
        ? Array.from(fandomBlock.querySelectorAll("a")).map(a => a.innerText.trim()).join(", ")
        : "";

    // --- РАЗМЕР ---
    const sizeBlock = findBlock("Размер:");
    let size = "";
    if (sizeBlock) {
        const match = sizeBlock.innerText.match(/(\d[\d\s]*\d)\s*слов/);
        size = match ? match[1] : "";
    }

    // --- ТЕГИ ---
    const tagsNode = document.querySelector(".description .tags");
    const tags = tagsNode
        ? Array.from(tagsNode.querySelectorAll("a")).map(a => a.innerText.trim()).join(", ")
        : "";

    // --- ОПИСАНИЕ ---
    const description = document.querySelector(".description .js-public-beta-description")?.innerText.trim() || "";

    // --- ПРИМЕЧАНИЯ ---
    const notes = document.querySelector(".description .js-public-beta-author-comment")?.innerText.trim() || "";

    // --- ПУБЛИКАЦИЯ НА ДРУГИХ РЕСУРСАХ ---
    const otherPublicationBlock = findBlock("Публикация на других ресурсах:");
    const otherPublication = otherPublicationBlock
        ? otherPublicationBlock.innerText.trim()
        : "";

    // --- ПЕЙРИНГИ И ПЕРСОНАЖИ ---
    const pairingBlock =
        findBlock("Пэйринг и персонажи:") ||
        findBlock("Пейринг и персонажи:");

    const pairings = pairingBlock
        ? Array.from(pairingBlock.querySelectorAll("a"))
            .map(a => a.innerText.trim())
            .filter(Boolean)
        : [];


    return {
        fandom,
        size,
        tags,
        description,
        notes,
        otherPublication,
        pairings };

}

function getDirectionRatingStatus() {

    /**
     * Извлекает основные характеристики произведения:
     * направленность, рейтинг и статус.
     */

    // For old layout
    // const direction = document.querySelector(".fanfic-badges .badge-with-icon.direction .badge-text")?.innerText.trim() || "";
    // const rating = document.querySelector(".fanfic-badges .badge-with-icon[class*='badge-rating'] .badge-text")?.innerText.trim() || "";
    // const status = document.querySelector(".fanfic-badges .badge-with-icon[class*='badge-status'] .badge-text")?.innerText.trim() || "";

    const root = document.querySelector(".fanfic-badges");
    if (!root) return {
        direction: "Направленность не найдена на странице",
        rating: "Рейтинг не найжен на странице",
        status: "Статус не найден на странице" };

    // Направленность (Слэш, Джен, Гет и т.п.)
    const directionNode = root.querySelector("[class*='direction']");

    const direction =
        directionNode?.querySelector("span")?.innerText.trim() ||
        directionNode?.innerText.trim() ||
        "";

    // Рейтинг (G, PG-13, R, NC-17…)
    const ratingNode = root.querySelector("[class*='ds-label-rating']");
    const rating = ratingNode?.innerText.trim() || "";

    // Статус (В процессе, Завершён, Заморожен…)
    const statusNode = root.querySelector("[class*='ds-label-status']");
    const status = statusNode?.innerText.trim() || "";


    return { direction, rating, status };
}

/**
* Извлекает автора оригинального произведения,
* если фанфик является адаптацией или переводом.
*/
function getOriginalAuthor() {
    const blocks = document.querySelectorAll(".mb-10");

    for (const block of blocks) {
        const strong = block.querySelector("strong");
        if (!strong) continue;

        if (strong.innerText.trim().startsWith("Автор оригинала")) {
            const link = block.querySelector("a");
            return {
                name: link?.innerText.trim() || "",
                url: link?.href || ""
            };
        }
    }

    return null;
}

// Извлекает ссылку на оригинальное произведение.
function getOriginalWork() {

    const blocks = document.querySelectorAll(".mb-10");

    for (const block of blocks) {
        const strong = block.querySelector("strong");
        if (!strong) continue;

        if (strong.innerText.trim().startsWith("Оригинал")) {
            const link = block.querySelector("a");
            if (!link) return null;

            let url = link.href;

            // Если это редирект — извлекаем оригинал
            if (url.includes("/away?url=")) {
                const real = url.split("/away?url=")[1];
                url = decodeURIComponent(real);
            }

            return { url };
        }
    }

    return null;
}

;// ./src/utils/delay.js
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

;// ./src/core/getFootnotes.js
/**
 * getFootnotes. js
 * Извлекает сноски из текста главы и формирует единый список примечаний.
 *
 * span.footnote → превращаем в <footnote-ref>
 * но БЕЗ outerHTML (чтобы не ломать DOM структуру)
 */

function fixHtml(html) {
    return html
        .replace(/<br>/g, "<br/>")
        .replace(/<hr>/g, "<hr/>")
        .replace(/&nbsp;/g, "&#160;");
}

function extractFootnotes(doc, contentNode, notesMap = {}) {
    const anchors = [...contentNode.querySelectorAll("span.footnote[id]")];
    const notes = [];

    anchors.forEach((anchor, index) => {
        const id = anchor.id;
        const text = notesMap[id];
        if (!text) return;

        const number = index + 1;

        // ❗ ВАЖНО: НЕ outerHTML
        // просто превращаем элемент в "placeholder"
        const ref = doc.createElement("footnote-ref");
        ref.setAttribute("id", id);
        ref.setAttribute("number", number);

        anchor.replaceWith(ref);

        notes.push({
            id,
            number,
            html: fixHtml(text)
        });
    });

    return notes;
}
;// ./src/core/getChapter.js
/**
 * getChapter.js
 *
 * Возвращает:
 *  title     — заголовок главы
 *  plain     — чистый текст
 *  xhtml     — XHTML для FB2/EPUB
 *  footnotes — сноски
 */




const MAX_ATTEMPTS = 7;

async function getChapter(url, attempt = 1) {
    await delay(400 + Math.random() * 300);

    let res;
    try {
        res = await fetch(url, { credentials: "same-origin" });
    } catch (e) {
        if (attempt < MAX_ATTEMPTS) {
            await delay(1000 * attempt);
            return getChapter(url, attempt + 1);
        }
        throw e;
    }

    const html = await res.text();

    const looksEmpty =
        !html ||
        html.length < 500 ||
        html.includes("cf-browser-verification") ||
        html.includes("Cloudflare") ||
        html.includes("Too Many Requests") ||
        html.includes("<title>429") ||
        html.includes("<title>502");

    if (looksEmpty) {
        if (attempt < MAX_ATTEMPTS) {
            await delay(1200 * attempt + Math.random() * 500);
            return getChapter(url, attempt + 1);
        }
        throw new Error(`Не удалось загрузить ${url}: пустой HTML`);
    }

    const doc = new DOMParser().parseFromString(html, "text/html");

    // -----------------------------
    // Заголовок
    // -----------------------------
    const title =
        doc.querySelector(".title-area h2, .part-title h3, .part-title h2, .part-title")?.textContent.trim() ||
        "Глава";

    // -----------------------------
    // Основной текст
    // -----------------------------
    let contentNode =
        doc.querySelector(".part_text") ||
        doc.querySelector("#content .part_text") ||
        doc.querySelector("[itemprop='articleBody']") ||
        null;

    // fallback — ищем самый большой текстовый блок
    if (!contentNode) {
        let best = null;
        let bestScore = 0;

        const blocks = doc.querySelectorAll("div, article, section");
        for (const el of blocks) {
            const text = (el.textContent || "").replace(/\s+/g, " ").trim();
            if (text.length < 200) continue;

            const cls = el.className || "";
            if (/header|footer|menu|nav|comment|promo|settings|captcha/i.test(cls)) continue;

            if (text.length > bestScore) {
                bestScore = text.length;
                best = el;
            }
        }

        contentNode = best;
    }

    if (!contentNode) {
        throw new Error(`Не найден текст главы: ${url}`);
    }

    // -----------------------------
    // Чистка мусора
    // -----------------------------
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
    `.replace(/\s+/g, " ")).forEach(el => el.remove());

    // -----------------------------
    // Плоский текст
    // -----------------------------
    const plain = (contentNode.textContent || "")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .trim();

    // -----------------------------
    // Сноски
    // -----------------------------
    const footnotesMatch = html.match(/\s+textFootnotes\s*=\s*({.*?})/);
    const notesMap = footnotesMatch ? JSON.parse(footnotesMatch[1]) : {};
    const footnotes = extractFootnotes(doc, contentNode, notesMap);

    // -----------------------------
    // XHTML (простая, но чистая)
    // -----------------------------
    function buildXhtml(node) {
        const blocks = [];

        const push = (txt) => {
            const t = txt.trim();
            if (t) blocks.push(`<p>${t}</p>`);
        };

        const processText = (text) => {
            // нормализуем пробелы
            text = text.replace(/\u00a0/g, " ");

            // разбиваем по переносам строк
            const lines = text.split(/\n+/);

            for (let line of lines) {
                line = line.trim();
                if (!line) continue;

                // если строка начинается с "—", делаем отдельный абзац
                if (/^—\s*/.test(line)) {
                    push(line);
                    continue;
                }

                push(line);
            }
        };

        const walk = (n) => {
            if (!n) return;

            if (n.nodeType === Node.TEXT_NODE) {
                processText(n.nodeValue);
                return;
            }

            if (n.nodeType !== Node.ELEMENT_NODE) return;

            const tag = n.tagName.toLowerCase();

            if (tag === "br") {
                blocks.push(`<p></p>`);
                return;
            }

            if (["p", "div", "section", "article"].includes(tag)) {
                const html = n.innerHTML
                    .replace(/<br\s*\/?>/gi, "\n")
                    .replace(/<\/p>/gi, "\n");

                processText(html);
                return;
            }

            n.childNodes.forEach(walk);
        };

        walk(node);

        return blocks.join("\n");
    }


    const xhtml = buildXhtml(contentNode);

    return {
        title,
        plain,
        xhtml,
        footnotes
    };
}


;// ./src/utils/generateFileName.js
/**
 * generateFileName.js Формирует базовое имя файла для экспорта.
 *
 * Итоговый формат:
 * author_-_title
 *
 * Используется для:
 * - FB2 файла
 * - EPUB файла
 * - архива экспортов
 */

function sanitizeFilePart(str) {
    return str.replace(/\s+/g, "_").replace(/[\\/:*?"<>|]+/g, "");
}

function generateFileBaseName(mainAuthorName, title) {
    return `${sanitizeFilePart(mainAuthorName)}_-_${sanitizeFilePart(title)}`;
}

;// ./src/utils/escapeXml.js
/**
 * Экранирует специальные символы XML.
 *
 * Нужно для безопасной вставки текста в:
 * - FB2
 * - EPUB
 * - XHTML
 *
 * Иначе документ может стать невалидным XML.
 */

function escapeXml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

;// ./src/utils/textToParagraphs.js
/**
 * textToParagraphs Преобразует обычный текст в XHTML-параграфы.
 *
 * - разбивает текст по переносам строк
 * - удаляет пустые строки
 * - экранирует XML-символы
 * - оборачивает каждую строку в <p>
 *
 * Генерация тела текста.
 */



function textToParagraphs(text) {
    return text.split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${escapeXml(line)}</p>`)
        .join("\n");
}

;// ./src/fb2/fb2Header.js
/**
 * fb2Header.js Формирует FB2 заголовок на основе метаданных произведения
 *
 * Сюда входят:
 * - информация об авторах (основной, соавторы, переводчики и т.д.)
 * - метаданные фанфика (фэндом, рейтинг, статус, размер)
 * - описание и примечания
 * - ссылки на оригинал и источник
 * - служебная информация FB2 (дата, id, язык)
 */




function buildFb2Header({
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
                                   description,
                                   notes,
                                   otherPublication,
                                   fandom,
                                   pairings,
                                   series
                               }) {

    return `<?xml version="1.0" encoding="utf-8"?>
<FictionBook 
    xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" 
    xmlns:xlink="http://www.w3.org/1999/xlink">

    <stylesheet type="text/css">
        .body{font-family : Verdana, Geneva, Arial, Helvetica, sans-serif;}
        .p{margin:0.5em 0 0 0.3em; padding:0.2em; text-align:justify;}
    </stylesheet>

    <description>
        <title-info>

            <author>
                <username>${escapeXml(mainAuthor.name)}</username>
                <first-name>${escapeXml(mainAuthor.name)}</first-name>
                <home-page>${escapeXml(mainAuthor.url)}</home-page>
            </author>

            <book-title>${escapeXml(title)}</book-title>

            <annotation>

                <p><strong>Ссылка на работу:</strong> ${escapeXml(location.href)}</p>
                <p><strong>Направленность:</strong> ${escapeXml(direction)}</p>

                ${mainAuthor
        ? `<p><strong>Автор:</strong> ${escapeXml(mainAuthor.name)} (${escapeXml(mainAuthor.url)})</p>`
        : `<p><strong>Автор:</strong> Оригинальный автор неизвестен</p>`
    }

                ${originalAuthor && mainAuthor?.name !== originalAuthor.name
        ? `<p><strong>Автор оригинала:</strong> ${escapeXml(originalAuthor.name)} (${escapeXml(originalAuthor.url)})</p>`
        : ""
    }

                ${originalWork
        ? `<p><strong>Оригинал:</strong> ${escapeXml(originalWork.url)}</p>`
        : ""
    }

                ${translators?.length
        ? `<p><strong>Переводчик:</strong> ${
            translators.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

                ${coauthors?.length
        ? `<p><strong>Соавторы:</strong> ${
            coauthors.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

                ${betas?.length
        ? `<p><strong>Бета:</strong> ${
            betas.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

                ${gammas?.length
        ? `<p><strong>Гамма:</strong> ${
            gammas.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

                ${series
        ? `<p><strong>Серия:</strong> ${escapeXml(series.name)} (${escapeXml(series.url)})</p>`
        : ""
    }

                <p><strong>Фэндом:</strong> ${escapeXml(fandom || "")}</p>

                ${pairings?.length
        ? `<p><strong>Пейринг и персонажи:</strong> ${escapeXml(pairings.join(", "))}</p>`
        : ""
    }

                <p><strong>Рейтинг:</strong> ${escapeXml(rating)}</p>
                <p><strong>Размер:</strong> ${escapeXml(size)} слов</p>
                <p><strong>Статус:</strong> ${escapeXml(status)}</p>
                <p><strong>Метки:</strong> ${escapeXml(tags || "")}</p>

                <p></p>

                <p><strong>Описание:</strong></p>
                ${textToParagraphs(description || "")}

                <p></p>

                <p><strong>Примечания:</strong></p>
                ${textToParagraphs(notes || "")}

                <p><strong>Публикация на других ресурсах:</strong> ${escapeXml(otherPublication || "")}</p>

            </annotation>

            <date value="${new Date().toISOString().split("T")[0]}">${new Date().toLocaleDateString()}</date>
            <lang>ru</lang>

        </title-info>

        <document-info>
            <program-used>https://ficbook.net</program-used>
            <date value="${new Date().toISOString()}">${new Date().toLocaleString()}</date>
            <src-url>${escapeXml(location.href)}</src-url>
            <id>${Date.now()}</id>
        </document-info>
    </description>
`;
}

;// ./src/fb2/fb2Toc.js
/**
 * Формирует оглавление FB2-книги.
 * Каждая глава превращается в ссылку вида:
 * <a xlink:href="#id">Название</a>
 * Это позволяет навигацию внутри FB2-файла.
 */

function buildFb2Toc(tocEntries) {
    return `
<body name="toc">
    <section>
        <title><p>Оглавление</p></title>
        ${tocEntries.map(ch => `
        <p><a xlink:href="#${ch.id}">${ch.title}</a></p>
        `).join("")}
    </section>
</body>
`;
}

;// ./src/fb2/fb2Body.js
/**
 * fb2Body Формирует тело FB2-книги.
 * Вставляется уже готовая разметка глав (fb2Chapters),
 * которая была собрана ранее из парсинга текста.
 */

function buildFb2Body(fb2Chapters) {
    return `
<body>
${fb2Chapters}
</body>
`;
}

;// ./src/fb2/fb2Builder.js
/**
 * fb2Builder.js — основной пайплайн сборки книги.
 *
 * Отвечает за:
 * - загрузку глав
 * - сбор метаданных (авторы, фэндом, рейтинг и т.д.)
 * - обработку сносок
 * - формирование FB2 (header + toc + body + notes)
 * - повторные попытки загрузки глав
 * - скачивание готового файла
 */














// Приведение HTML-сущностей к FB2-совместимому виду
function cleanHtmlEntitiesForFb2(text) {
    if (!text) return text;

    return text
        .replace(/&nbsp;/g, " ")
        .replace(/&mdash;/g, "—")
        .replace(/&ndash;/g, "–")
        .replace(/&hellip;/g, "…")
        .replace(/&laquo;/g, "«")
        .replace(/&raquo;/g, "»")
        .replace(/&copy;/g, "©")
        .replace(/&reg;/g, "®")
        .replace(/&bull;/g, "•")
        .replace(/&middot;/g, "·")
        // удаляем любые неизвестные сущности
        .replace(/&([a-zA-Z0-9]+);/g, "$1");
}


// FB2: преобразование <footnote-ref/> в FB2-сноски со сквозной нумерацией
function renderFb2Footnotes(xhtml, footnotes, globalIndexRef) {
    if (!footnotes || !footnotes.length) {
        return { content: xhtml, notes: [] };
    }

    let content = xhtml;
    let notes = [];

    footnotes.forEach(n => {
        const globalNumber = globalIndexRef.value++;

        // Самозакрывающийся <footnote-ref .../>
        const reSelfClosing = new RegExp(
            `<footnote-ref[^>]*id=["']${n.id}["'][^>]*\\/?>`,
            "g"
        );

        // Полный <footnote-ref ...>...</footnote-ref>
        const reFull = new RegExp(
            `<footnote-ref[^>]*id=["']${n.id}["'][^>]*>[\\s\\S]*?<\\/footnote-ref>`,
            "g"
        );

        // Заменяем оба варианта
        content = content
            .replace(reSelfClosing, `<a xlink:href="#note_${n.id}" type="note">[${globalNumber}]</a>`)
            .replace(reFull, `<a xlink:href="#note_${n.id}" type="note">[${globalNumber}]</a>`);

        notes.push({
            id: n.id,
            number: globalNumber,
            html: cleanHtmlEntitiesForFb2(n.html)
        });
    });

    // Удаляем ВСЕ оставшиеся </footnote-ref>, если сайт вставил их криво
    content = content.replace(/<\/footnote-ref>/g, "");

    return { content, notes };
}

/**
 * Основная функция генерации FB2-файла.
 *
 * Пайплайн:
 * 1. загрузка основной страницы фанфика
 * 2. сбор метаданных (авторы, фэндом, серия и т.д.)
 * 3. получение списка глав
 * 4. загрузка каждой главы
 * 5. обработка сносок
 * 6. повторная попытка неудачных глав
 * 7. сбор FB2 (header + toc + body + notes)
 * 8. скачивание файла
 */
async function createFB2(onProgress = () => {}, isCancelled = () => false) {

    // ---------------------------------------------------------
    // Загружаем страницу фика в скрытый iframe, если мы на странице главы
    // ---------------------------------------------------------
    async function loadFicMainPageIfNeeded() {
        const url = new URL(location.href);
        const parts = url.pathname.split("/").filter(Boolean);

        if (parts.length === 2 && parts[0] === "readfic") {
            return document;
        }

        if (parts.length === 3 && parts[0] === "readfic") {
            const ficId = parts[1];
            const ficUrl = `https://ficbook.net/readfic/${ficId}`;

            return new Promise((resolve, reject) => {
                const iframe = document.createElement("iframe");
                iframe.style.display = "none";
                iframe.src = ficUrl;

                iframe.onload = () => {
                    try {
                        resolve(iframe.contentDocument);
                    } catch (e) {
                        reject(e);
                    }
                };

                document.body.appendChild(iframe);
            });
        }

        return document;
    }

    const ficDoc = await loadFicMainPageIfNeeded();


    // ---------------------------------------------------------
    // METADATA
    // ---------------------------------------------------------
    const title = getTitle();
    const authors = getAuthors();
    if (!authors.length) {
        alert("Авторы не найдены, возможно, изменился HTML Ficbook.");
        return;
    }

    const originalAuthor = getOriginalAuthor();
    const originalWork = getOriginalWork();

    const translators = authors.filter(a => a.role === "переводчик");
    const mainAuthor =
        authors.find(a => a.role === "автор") ||
        originalAuthor ||
        null;

    const betas = authors.filter(a => a.role === "бета");
    const gammas = authors.filter(a => a.role === "гамма");
    const coauthors = authors.filter(a => a.role === "соавтор");

    const { fandom, size, tags, description, notes, otherPublication, pairings } = getExtraData();
    const { direction, rating, status } = getDirectionRatingStatus();


    // ---------------------------------------------------------
    // SERIES
    // ---------------------------------------------------------
    let series = null;

    const seriesLink = ficDoc.querySelector(".mb-10 a[href^='/series/']");
    if (seriesLink) {
        series = {
            name: seriesLink.innerText.trim(),
            url: "https://ficbook.net" + seriesLink.getAttribute("href")
        };
    }


    // ---------------------------------------------------------
    // CHAPTERS
    // ---------------------------------------------------------
    let rawChapters = Array.from(ficDoc.querySelectorAll(".list-of-fanfic-parts .part-link"))
        .filter(ch => {
            if (!ch.href) return false;
            if (ch.href.includes("/all-parts")) return false;
            let clean = ch.href.split("#")[0];
            let last = clean.split("/").pop();
            return /^\d+$/.test(last);
        });

    if (rawChapters.length === 0) {
        rawChapters = [{ href: location.href }];
    }

    let chapters = [];
    let seen = new Set();
    for (let ch of rawChapters) {
        if (!seen.has(ch.href)) {
            seen.add(ch.href);
            chapters.push(ch);
        }
    }

    const total = chapters.length;

    // ---------------------------------------------------------
    // FB2 HEADER
    // ---------------------------------------------------------
    let fb2Header = buildFb2Header({
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
        description: cleanHtmlEntitiesForFb2(description),
        notes: cleanHtmlEntitiesForFb2(notes),
        otherPublication,
        fandom,
        pairings,
        series
    });

    let fb2Chapters = "";
    let tocEntries = [];
    let chapterIndex = 1;

    let globalFootnoteIndex = { value: 1 };
    let allNotes = [];

    let failedChapters = [];


    // ---------------------------------------------------------
    // FIRST PASS
    // ---------------------------------------------------------
    for (let chapter of chapters) {

        if (isCancelled()) throw new Error("cancelled");

        onProgress(chapterIndex, total);

        await delay(200 + Math.random() * 200);

        try {
            let { title: chTitle, xhtml, footnotes } = await getChapter(chapter.href);

            xhtml = cleanHtmlEntitiesForFb2(xhtml);

            const { content, notes } = renderFb2Footnotes(xhtml, footnotes, globalFootnoteIndex);
            allNotes.push(...notes);

            tocEntries.push({
                id: `ch${chapterIndex}`,
                // title: `•\u2003${chTitle}`
                title: `${chapterIndex}. ${chTitle}`
            });

            fb2Chapters += `
<section id="ch${chapterIndex}">
<!--    <title><p>•\u2003${chTitle}</p></title>-->
    <title><p>${chapterIndex}. ${chTitle}</p></title>
    ${content}
</section>`;

        } catch (err) {
            console.warn("Не удалось загрузить главу:", chapter.href, err);
            failedChapters.push({ chapter, index: chapterIndex });
        }

        chapterIndex++;
    }


    // ---------------------------------------------------------
    // SECOND PASS
    // ---------------------------------------------------------
    if (failedChapters.length > 0) {
        console.warn("Повторная загрузка неудачных глав:", failedChapters.length);

        for (let item of failedChapters) {
            const { chapter, index } = item;

            await delay(500 + Math.random() * 500);

            try {
                let { title: chTitle, xhtml, footnotes } = await getChapter(chapter.href);

                xhtml = cleanHtmlEntitiesForFb2(xhtml);

                const { content, notes } = renderFb2Footnotes(xhtml, footnotes, globalFootnoteIndex);
                allNotes.push(...notes);

                tocEntries[index - 1] = {
                    id: `ch${index}`,
                    // title: `•\u2003${chTitle}`
                    title: `${chapterIndex}. ${chTitle}`
                };

                fb2Chapters += `
<section id="ch${index}">
<!--    <title><p>•\u2003${chTitle}</p></title>-->
    <title><p>${chapterIndex}. ${chTitle}</p></title>
    ${content}
</section>`;

                item.success = true;

            } catch (err) {
                console.warn("Повторно не удалось загрузить:", chapter.href);
                item.success = false;
            }
        }

        failedChapters = failedChapters.filter(ch => !ch.success);
    }

    // ---------------------------------------------------------
    // FINAL CHECK
    // ---------------------------------------------------------
    if (failedChapters.length > 0) {
        alert(
            "Некоторые главы не удалось загрузить:\n" +
            failedChapters.map(f => f.chapter.href).join("\n")
        );
    }

    // ---------------------------------------------------------
    // BUILD FB2
    // ---------------------------------------------------------
    let fb2Toc = buildFb2Toc(tocEntries);
    let fb2Body = buildFb2Body(fb2Chapters);

    let fb2NotesBody = "";

    if (allNotes.length) {
        fb2NotesBody = `
<body name="notes">
${allNotes
            .map(n => `
<section id="note_${n.id}">
    <title>${n.number}</title>
    <p>${n.html}</p>
</section>
`)
            .join("\n")}
</body>
`;
    }

    const fullFb2 = fb2Header + fb2Toc + fb2Body + fb2NotesBody + "</FictionBook>";

    const safeAuthorName = mainAuthor?.name || "UnknownAuthor";
    const translatorName = translators[0]?.name || null;

    let titlePart = title;
    if (translatorName) {
        titlePart += `_[${translatorName}]`;
    }

    const baseName = generateFileBaseName(safeAuthorName, titlePart);
    const fileName = `${baseName}.fb2`;

    // let blob = new Blob([fullFb2], { type: "text/xml" });

    let blob = new Blob([fullFb2], {
        type: "application/octet-stream"
    });

    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

;// ./src/epub/epubCss.js
const epubCss = `
body {
    margin: 0;
    padding: 0 8%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    line-height: 1.6;
    font-size: 1em;
}
h1, h2, h3 {
    font-weight: 700;
    margin: 1.2em 0 0.6em;
}
h1 {
    font-size: 1.6em;
    text-align: center;
}
p {
    margin: 0.6em 0;
}
strong {
    font-weight: 700;
}
.title-page {
    margin-top: 20%;
    text-align: center;
}
.title-page h1 {
    font-size: 1.8em;
    margin-bottom: 0.4em;
}
.title-page h2 {
    font-size: 1.2em;
    margin-top: 0;
    color: #555;
}
.meta-block {
    margin-top: 2em;
    font-size: 0.9em;
    color: #555;
}
.meta-block p {
    margin: 0.2em 0;
}
`;

;// ./src/epub/epubTemplates.js
/**
 * EPUB HTML-шаблоны
 *
 * Генерация:
 * - титульной страницы (titlepage.xhtml)
 * - страниц глав (chapter.xhtml)
 * - HTML-оглавления (toc.xhtml)
 */




/**
 * ТИТУЛЬНАЯ СТРАНИЦА EPUB
 *
 * Содержит:
 * - название фанфика
 * - автора и соавторов
 * - метаданные (фэндом, рейтинг, теги и т.д.)
 * - описание и примечания
 */
function buildTitlePage({
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
                                   description,
                                   notes,
                                   otherPublication,
                                   fandom,
                                   pairings,
                                   series
                               }) {
    return `
<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops"
      xml:lang="ru">
<head>
    <title>${escapeXml(title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <!-- === ТИТУЛЬНАЯ СТРАНИЦА === -->
    <div class="title-page">
        <h1>${escapeXml(title)}</h1>
        <h2>${escapeXml(mainAuthor.name)}</h2>

        <div class="meta-block">
            <p><strong>Ссылка на работу:</strong> ${escapeXml(location.href)}</p>
            <p><strong>Направленность:</strong> ${escapeXml(direction)}</p>
            <p><strong>Автор:</strong> ${escapeXml(mainAuthor.name)} (${escapeXml(mainAuthor.url)})</p>

            ${translators?.length
        ? `<p><strong>Переводчик:</strong> ${
            translators.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

            ${betas?.length
        ? `<p><strong>Бета:</strong> ${
            betas.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

            ${gammas?.length
        ? `<p><strong>Гамма:</strong> ${
            gammas.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

            ${coauthors?.length
        ? `<p><strong>Соавторы:</strong> ${
            coauthors.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

            ${series
        ? `<p><strong>Серия:</strong> ${escapeXml(series.name)} (${escapeXml(series.url)})</p>`
        : ""
    }

            <p><strong>Фэндом:</strong> ${escapeXml(fandom)}</p>

            ${pairings?.length
        ? `<p><strong>Пейринги и персонажи:</strong> ${escapeXml(pairings.join(", "))}</p>`
        : ""
    }

            <p><strong>Рейтинг:</strong> ${escapeXml(rating)}</p>
            <p><strong>Размер:</strong> ${escapeXml(size)} слов</p>
            <p><strong>Статус:</strong> ${escapeXml(status)}</p>
            <p><strong>Метки:</strong> ${escapeXml(tags)}</p>
        </div>
    </div>

    <h2>Описание</h2>
    ${textToParagraphs(description)}

    ${notes ? `<h2>Примечания</h2>\n${textToParagraphs(notes)}` : ""}

    ${otherPublication ? `<h2>Публикация на других ресурсах</h2>\n<p>${escapeXml(otherPublication)}</p>` : ""}

</body>
</html>
`.trim();
}

/**
 * СТРАНИЦА ГЛАВЫ EPUB
 *
 * Каждая глава — отдельный XHTML файл внутри EPUB.
 */
function buildChapterPage(ch) {
    return `
<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops"
      xml:lang="ru">
<head>
    <title>${escapeXml(ch.title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>${escapeXml(ch.title)}</h1>
    
    <!-- основной контент главы -->
    ${ch.content}
</body>
</html>
`.trim();
}


// HTML-оглавление EPUB (toc.xhtml)
function buildTocXhtml(chapters) {
    const tocItems = chapters.map(ch => `
        <li><a href="${escapeXml(ch.file)}">${escapeXml(ch.title)}</a></li>
    `).join("\n");

    return `
<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops"
      xml:lang="ru">
<head>
    <title>Оглавление</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>Оглавление</h1>
    <ol>
        ${tocItems}
    </ol>
</body>
</html>
`.trim();
}

;// ./src/epub/epubOpf.js
/**
 * EPUB OPF файл (package document)
 *
 * Отвечает за:
 * - метаданные книги (title, author, language)
 * - список файлов (manifest)
 * - порядок чтения (spine)
 * - идентификацию EPUB-книги
 */


function buildOpf({ title, mainAuthor, description, chapters, translators }) {
    const now = new Date();
    const isoDate = now.toISOString().split("T")[0];

    const manifest = [
        `<item id="css" href="style.css" media-type="text/css"/>`,
        `<item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>`,
        `<item id="toc" href="toc.xhtml" media-type="application/xhtml+xml"/>`,
        ...chapters.map(ch =>
            `<item id="${ch.id}" href="${ch.file}" media-type="application/xhtml+xml"/>`
        ),
        `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`
    ].join("\n        ");

    // SPINE — порядок чтения книги
    const spine = [
        `<itemref idref="titlepage"/>`,
        `<itemref idref="toc"/>`,
        ...chapters.map(ch => `<itemref idref="${ch.id}"/>`)
    ].join("\n        ");

    return `
<?xml version="1.0" encoding="utf-8"?>
<package version="2.0"
    xmlns="http://www.idpf.org/2007/opf"
    unique-identifier="BookId">

        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        
            <!-- === МЕТАДАННЫЕ КНИГИ === -->
            <dc:title>${escapeXml(title)}</dc:title>
            
            <dc:creator>${escapeXml(
        mainAuthor?.name ||
        translators?.[0]?.name ||
        "UnknownAuthor"
    )}</dc:creator>
    
            <dc:language>ru</dc:language>
            
            <dc:identifier id="BookId">urn:uuid:${Date.now()}</dc:identifier>
            
            <dc:date>${isoDate}</dc:date>
            
            <dc:subject>fiction</dc:subject>
            
            <dc:description>${escapeXml(description.slice(0, 500))}</dc:description>
            
            <!-- источник оригинальной страницы -->
            <meta name="source" content="${escapeXml(location.href)}"/>
        </metadata>

        <manifest>
            ${manifest}
        </manifest>

        <spine toc="ncx">
            ${spine}
        </spine>

</package>
`.trim();
}

;// ./src/epub/epubNcx.js
/**
 * EPUB 2.0 навигационный файл (NCX)
 *
 * Отвечает за:
 * - структуру оглавления EPUB
 * - навигацию между главами
 * - совместимость со старыми ридерами
 */



function buildNcx(title, chapters) {

    // Генерация навигационных пунктов для каждой главы
    const navPoints = chapters.map((ch, i) => `
        <navPoint id="navPoint-${i + 2}" playOrder="${i + 2}">
            <navLabel><text>${escapeXml(ch.title)}</text></navLabel>
            <content src="${ch.file}"/>
        </navPoint>
    `).join("\n");

    return `
<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/"
    version="2005-1">
    <head>
        <!-- уникальный идентификатор книги -->
        <meta name="dtb:uid" content="urn:uuid:${Date.now()}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>${escapeXml(title)}</text>
    </docTitle>
    <navMap>
        <!-- пункт оглавления -->
        <navPoint id="navPoint-1" playOrder="1">
            <navLabel><text>Оглавление</text></navLabel>
            <content src="toc.xhtml"/>
        </navPoint>
        <!-- главы -->
        ${navPoints}
    </navMap>
</ncx>
`.trim();
}

;// ./src/epub/epubBuilder.js
/**
 * Основной модуль сборки EPUB-файла.
 * Отвечает за полный процесс экспорта фанфика в EPUB:
 * - загрузка страницы фанфика и списка глав
 * - сбор метаданных (авторы, фэндом, рейтинг, серия и т.д.)
 * - загрузка и обработка каждой главы
 * - обработка сносок (преобразование footnote-ref в EPUB-структуру)
 * - повторная загрузка неудачных глав
 * - формирование структуры EPUB через JSZip
 * - создание всех файлов внутри архива (xhtml, opf, ncx, css, toc)
 * - генерация и скачивание готового .epub файла
 */














// Очистка HTML‑сущностей
function cleanHtmlEntities(text) {
    if (!text) return text;

    return text
        .replace(/&nbsp;/g, " ")
        .replace(/&mdash;/g, "—")
        .replace(/&ndash;/g, "–")
        .replace(/&hellip;/g, "…")
        .replace(/&laquo;/g, "«")
        .replace(/&raquo;/g, "»")
        .replace(/&copy;/g, "©")
        .replace(/&reg;/g, "®")
        .replace(/&bull;/g, "•")
        .replace(/&middot;/g, "·")
        .replace(/&([a-zA-Z0-9]+);/g, "$1");
}


// === Обработка сносок для EPUB ===
// - заменяет footnote-ref на ссылки
// - добавляет <aside> блоки с текстом сносок
function renderEpubFootnotes(xhtml, footnotes) {
    if (!footnotes || !footnotes.length) return xhtml;

    let content = xhtml;

    // ищем ссылку по id сноски
    footnotes.forEach(n => {
        const re = new RegExp(
            `<footnote-ref[^>]*id=["']${n.id}["'][^>]*>([\\s\\S]*?)<\\/footnote-ref>|<footnote-ref[^>]*id=["']${n.id}["'][^>]*\\/?>`,
            "g"
        );

        // заменяем на EPUB ссылку на footnote
        content = content.replace(
            re,
            `<a href="#${n.id}_text" epub:type="noteref" class="footnote-ref">[${n.number}]</a>`
        );
    });

    // формируем блок всех сносок
    const notesHtml = footnotes
        .map(
            n => `
        <aside id="${n.id}_text" epub:type="footnote" class="footnote">
            <p><sup>${n.number}</sup> ${cleanHtmlEntities(n.html)}</p>
        </aside>`
        )
        .join("");

    content += `
<div class="footnotes">
    ${notesHtml}
</div>
`;

    return content;
}

// === Основная функция сборки EPUB ===
async function createEPUB(onProgress = () => {}, isCancelled = () => false) {

    // ---------------------------------------------------------
    // Загружаем страницу содержания в iframe, если мы на странице главы
    // ---------------------------------------------------------
    async function loadFicMainPageIfNeeded() {
        const url = new URL(location.href);
        const parts = url.pathname.split("/").filter(Boolean);

        if (parts.length === 2 && parts[0] === "readfic") {
            return document;
        }

        // если открыта глава — грузим главную страницу фанфика
        if (parts.length === 3 && parts[0] === "readfic") {
            const ficId = parts[1];
            const ficUrl = `https://ficbook.net/readfic/${ficId}`;

            return new Promise((resolve, reject) => {
                const iframe = document.createElement("iframe");
                iframe.style.display = "none";
                iframe.src = ficUrl;

                iframe.onload = () => {
                    try {
                        resolve(iframe.contentDocument);
                    } catch (e) {
                        reject(e);
                    }
                };

                document.body.appendChild(iframe);
            });
        }

        return document;
    }

    const ficDoc = await loadFicMainPageIfNeeded();


    // ---------------------------------------------------------
    // Подгрузка JSZip (если нет)
    // ---------------------------------------------------------
    if (!window.JSZip) {
        await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
            s.onload = resolve;
            s.onerror = () => reject(new Error("Не удалось загрузить JSZip"));
            document.head.appendChild(s);
        });
    }

    // ---------------------------------------------------------
    // METADATA
    // ---------------------------------------------------------
    const title = getTitle();
    const authors = getAuthors();
    if (!authors.length) {
        alert("Авторы не найдены, возможно, изменился HTML Ficbook.");
        return;
    }

    const originalAuthor = getOriginalAuthor();
    const translators = authors.filter(a => a.role === "переводчик");

    const mainAuthor =
        authors.find(a => a.role === "автор") ||
        originalAuthor ||
        null;

    const betas = authors.filter(a => a.role === "бета");
    const gammas = authors.filter(a => a.role === "гамма");
    const coauthors = authors.filter(a => a.role === "соавтор");

    const { fandom, size, tags, description, notes, otherPublication, pairings } = getExtraData();
    const { direction, rating, status } = getDirectionRatingStatus();


    // ---------------------------------------------------------
    // SERIES
    // ---------------------------------------------------------
    let series = null;

    const seriesLink = ficDoc.querySelector(".mb-10 a[href^='/series/']");
    if (seriesLink) {
        series = {
            name: seriesLink.innerText.trim(),
            url: "https://ficbook.net" + seriesLink.getAttribute("href")
        };
    }


    // ---------------------------------------------------------
    // CHAPTERS
    // ---------------------------------------------------------
    let rawChapters = Array.from(ficDoc.querySelectorAll(".list-of-fanfic-parts .part-link"))
        .filter(ch => {
            if (!ch.href) return false;
            if (ch.href.includes("/all-parts")) return false;
            let clean = ch.href.split("#")[0];
            let last = clean.split("/").pop();
            return /^\d+$/.test(last);
        });

    // если глав нет — считаем одну текущую страницу
    if (rawChapters.length === 0) {
        rawChapters = [{ href: location.href }];
    }

    // убираем дубликаты
    let chaptersList = [];
    let seen = new Set();
    for (let ch of rawChapters) {
        if (!seen.has(ch.href)) {
            seen.add(ch.href);
            chaptersList.push(ch);
        }
    }

    const total = chaptersList.length;
    const chapters = [];
    let index = 1;

    let failedChapters = [];


    // ---------------------------------------------------------
    // FIRST PASS
    // ---------------------------------------------------------
    for (let chapter of chaptersList) {

        if (isCancelled()) throw new Error("cancelled");

        onProgress(index, total);

        await new Promise(r => setTimeout(r, 200 + Math.random() * 200));

        try {
            let { title: chTitle, xhtml, footnotes } = await getChapter(chapter.href);

            xhtml = cleanHtmlEntities(xhtml);

            let content = renderEpubFootnotes(xhtml, footnotes);

            chapters.push({
                id: `chapter${index}`,
                file: `chapter${index}.xhtml`,
                title: chTitle,
                content
            });

        } catch (err) {
            console.warn("Не удалось загрузить главу:", chapter.href, err);
            failedChapters.push({ chapter, index });
        }

        index++;
    }


    // ---------------------------------------------------------
    // SECOND PASS
    // ---------------------------------------------------------
    if (failedChapters.length > 0) {
        console.warn("Повторная загрузка неудачных глав:", failedChapters.length);

        for (let item of failedChapters) {
            const { chapter, index } = item;

            await new Promise(r => setTimeout(r, 500 + Math.random() * 500));

            try {
                let { title: chTitle, xhtml, footnotes } = await getChapter(chapter.href);

                xhtml = cleanHtmlEntities(xhtml);

                let content = renderEpubFootnotes(xhtml, footnotes);

                chapters[index - 1] = {
                    id: `chapter${index}`,
                    file: `chapter${index}.xhtml`,
                    title: chTitle,
                    content
                };

                item.success = true;

            } catch (err) {
                console.warn("Повторно не удалось загрузить:", chapter.href);
                item.success = false;
            }
        }

        failedChapters = failedChapters.filter(ch => !ch.success);
    }


    if (failedChapters.length > 0) {
        alert(
            "Некоторые главы не удалось загрузить:\n" +
            failedChapters.map(f => f.chapter.href).join("\n")
        );
    }


    // ---------------------------------------------------------
    // СБОРКА EPUB АРХИВА
    // ---------------------------------------------------------
    const zip = new JSZip();

    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

    // структура контейнера
    zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0"
    xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf"
            media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`);

    // стили
    zip.file("OEBPS/style.css", epubCss.trim());

    // титульная страница
    zip.file("OEBPS/titlepage.xhtml", buildTitlePage({
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
        description: cleanHtmlEntities(description),
        notes: cleanHtmlEntities(notes),
        otherPublication,
        fandom,
        pairings,
        series
    }));

    // главы
    chapters.forEach(ch => {
        zip.file(`OEBPS/${ch.file}`, buildChapterPage(ch));
    });

    // оглавление
    zip.file("OEBPS/toc.xhtml", buildTocXhtml(chapters));

    // OPF манифест
    zip.file("OEBPS/content.opf", buildOpf({
        title,
        mainAuthor,
        description: cleanHtmlEntities(description),
        chapters,
        translators,
        series
    }));

    // NCX навигация
    zip.file("OEBPS/toc.ncx", buildNcx(title, chapters));

    // === СКАЧИВАНИЕ ===
    const safeAuthorName = mainAuthor?.name || "UnknownAuthor";
    const translatorName = translators[0]?.name || null;

    let titlePart = title;
    if (translatorName) {
        titlePart += `_[${translatorName}]`;
    }

    const baseName = generateFileBaseName(safeAuthorName, titlePart);
    const fileName = `${baseName}.epub`;

    const blob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/epub+zip"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

;// ./src/ui/buttons.js
/**
 * UI-кнопки для экспорта фанфика:
 * - FB2
 * - EPUB
 * - остановка всех активных загрузок
 *
 * Также управляет состоянием:
 * - параллельные загрузки
 * - отмена процессов
 * - обновление UI во время скачивания
 */

function createButtons(createFB2, createEPUB) {

    // === ГЛОБАЛЬНЫЙ СЧЁТЧИК АКТИВНЫХ ЗАГРУЗОК ===
    // для отображения кнопки "Остановить"
    let activeDownloads = 0;

    function updateStopButton() {
        stopBtn.style.display = activeDownloads > 0 ? "block" : "none";
    }

    // === КОНТЕЙНЕР UI ===
    const container = document.createElement("div");
    container.id = "ficbook-export-buttons";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "10000";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";

    /**
     * Вспомогательная функция создания кнопок с единым стилем
     */
    function createButton(label, bgColor) {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.style.padding = "8px 12px";
        btn.style.borderRadius = "999px";
        btn.style.border = "none";
        btn.style.cursor = "pointer";
        btn.style.background = bgColor;
        btn.style.color = "#fff";
        btn.style.fontSize = "13px";
        btn.style.fontWeight = "600";
        btn.style.opacity = "0.9";
        btn.style.transition = "opacity 0.15s ease, transform 0.1s ease";
        return btn;
    }

    const fb2Btn = createButton("Скачать FB2", "#3b82f6");
    const epubBtn = createButton("Скачать EPUB", "#16a34a");
    const stopBtn = createButton("Остановить загрузку", "#dc2626");
    stopBtn.style.display = "none";

    // === ГЛОБАЛЬНАЯ ОТМЕНА ВСЕХ ЗАГРУЗОК ===
    let cancelCallbacks = new Set();

    // Вызываем все зарегистрированные cancel-функции
    stopBtn.onclick = () => {
        stopBtn.textContent = "Остановка...";

        cancelCallbacks.forEach(cb => cb());
        cancelCallbacks.clear();

        // НЕ обнуляем activeDownloads
        updateStopButton();
    };

    // === ОБЁРТКА ДЛЯ ЗАПУСКА ЛЮБОЙ ЗАГРУЗКИ ===
    function runDownload(startFn, button, label) {
        let cancelled = false;

        // Регистрируем отмену
        const cancelFn = () => {
            cancelled = true;
        };

        cancelCallbacks.add(cancelFn);

        activeDownloads++;
        updateStopButton();

        button.disabled = true;
        button.textContent = label;

        startFn(
            (current, total) => {
                if (cancelled) throw new Error("cancelled");
                // Обновление прогресса загрузки
                button.textContent = `${label}: Загружается глава ${current}/${total}`;
            },
            () => cancelled
        )
            .catch(err => {
                if (err.message === "cancelled") {
                    button.textContent = "Отменено";
                }
            })
            .finally(() => {

                // Удаляем callback отмены
                cancelCallbacks.delete(cancelFn);

                activeDownloads--;
                updateStopButton();

                button.disabled = false;
                button.textContent = label;
                stopBtn.textContent = "Остановить загрузку";
            });
    }

    // === FB2 экспорт ===
    fb2Btn.onclick = () => {
        runDownload(createFB2, fb2Btn, "Скачать FB2");
    };

    // === EPUB экспорт ===
    epubBtn.onclick = () => {
        runDownload(createEPUB, epubBtn, "Скачать EPUB");
    };

    container.appendChild(stopBtn);
    container.appendChild(fb2Btn);
    container.appendChild(epubBtn);
    document.body.appendChild(container);
}

;// ./src/main.js




function insertButtons() {
    if (!document.querySelector("#ficbook-export-buttons")) {
        console.log("Вставляем кнопки");
        createButtons(createFB2, createEPUB);
    }
}

// 1. Сразу пытаемся вставить кнопки.
// Если DOM уже готов — кнопки появятся мгновенно.
// Если нет — их добавит DOMContentLoaded ниже.
insertButtons();

// 2. Если DOM ещё не готов — ждём
document.addEventListener("DOMContentLoaded", insertButtons);

// 3. Подстраховка: если сайт перерисует страницу
const observer = new MutationObserver(insertButtons);
observer.observe(document.body, { childList: true, subtree: true });

