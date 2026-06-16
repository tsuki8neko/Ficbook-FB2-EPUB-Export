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

import { getTitle } from "../core/getTitle.js";
import { getAuthors } from "../core/getAuthors.js";
import { getExtraData, getDirectionRatingStatus } from "../core/getMeta.js";
import { getChapter } from "../core/getChapter.js";
import { delay } from "../utils/delay.js";
import { generateFileBaseName } from "../utils/generateFileName.js";

import { buildFb2Header } from "./fb2Header.js";
import { buildFb2Toc } from "./fb2Toc.js";
import { buildFb2Body } from "./fb2Body.js";
import { getOriginalAuthor, getOriginalWork } from "../core/getMeta.js";


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
export async function createFB2(onProgress = () => {}, isCancelled = () => false) {

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
