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

import { getTitle } from "../core/getTitle.js";
import { getAuthors } from "../core/getAuthors.js";
import { getExtraData, getDirectionRatingStatus } from "../core/getMeta.js";
import { getChapter } from "../core/getChapter.js";
import { generateFileBaseName } from "../utils/generateFileName.js";

import { epubCss } from "./epubCss.js";
import { buildTitlePage, buildChapterPage, buildTocXhtml } from "./epubTemplates.js";
import { buildOpf } from "./epubOpf.js";
import { buildNcx } from "./epubNcx.js";
import { getOriginalAuthor } from "../core/getMeta.js";


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
export async function createEPUB(onProgress = () => {}, isCancelled = () => false) {

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
