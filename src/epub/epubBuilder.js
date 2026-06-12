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


// Преобразование универсальных сносок в EPUB-сноски
function renderEpubFootnotes(xhtml, footnotes) {
    if (!footnotes || !footnotes.length) return xhtml;

    let content = xhtml;

    footnotes.forEach(n => {
        // Матчим весь элемент <footnote-ref ...>...</footnote-ref> ИЛИ самозакрывающий
        const re = new RegExp(
            `<footnote-ref[^>]*id=["']${n.id}["'][^>]*>(?:[\\s\\S]*?)<\\/footnote-ref>|<footnote-ref[^>]*id=["']${n.id}["'][^>]*\\/?>`,
            "g"
        );

        content = content.replace(
            re,
            `<a href="#${n.id}_text" epub:type="noteref" class="footnote-ref">[${n.number}]</a>`
        );
    });

    const notesHtml = footnotes
        .map(
            n => `
        <aside id="${n.id}_text" epub:type="footnote" class="footnote">
            <p><sup>${n.number}</sup> ${n.html}</p>
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




export async function createEPUB(onProgress = () => {}, isCancelled = () => false) {
    // JSZip loader
    if (!window.JSZip) {
        await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
            s.onload = resolve;
            s.onerror = () => reject(new Error("Не удалось загрузить JSZip"));
            document.head.appendChild(s);
        });
    }

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

    // ---------- СБОР СПИСКА ГЛАВ ----------
    let rawChapters = Array.from(document.querySelectorAll(".list-of-fanfic-parts .part-link"))
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

    // ---------- ПЕРВЫЙ ПРОХОД ----------
    for (let chapter of chaptersList) {

        if (isCancelled()) throw new Error("cancelled");

        onProgress(index, total);

        await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

        try {
            let { title: chTitle, xhtml, footnotes } = await getChapter(chapter.href);

            // 🔥 ВСТАВЛЯЕМ EPUB-СНОСКИ
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

    // ---------- ВТОРОЙ ПРОХОД ----------
    if (failedChapters.length > 0) {
        console.warn("Повторная загрузка неудачных глав:", failedChapters.length);

        for (let item of failedChapters) {
            const { chapter, index } = item;

            await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

            try {
                let { title: chTitle, xhtml, footnotes } = await getChapter(chapter.href);

                // 🔥 ВСТАВЛЯЕМ EPUB-СНОСКИ
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

    // ---------- СБОР EPUB ----------
    const zip = new JSZip();

    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

    zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0"
    xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf"
            media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`);

    zip.file("OEBPS/style.css", epubCss.trim());

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
        description,
        notes,
        otherPublication,
        fandom,
        pairings
    }));

    chapters.forEach(ch => {
        zip.file(`OEBPS/${ch.file}`, buildChapterPage(ch));
    });

    zip.file("OEBPS/toc.xhtml", buildTocXhtml(chapters));

    zip.file("OEBPS/content.opf", buildOpf({
        title,
        mainAuthor,
        description,
        chapters,
        translators
    }));

    zip.file("OEBPS/toc.ncx", buildNcx(title, chapters));

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
