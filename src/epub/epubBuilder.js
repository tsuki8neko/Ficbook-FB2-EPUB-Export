import { getTitle } from "../core/getTitle.js";
import { getAuthors } from "../core/getAuthors.js";
import { getExtraData, getDirectionRatingStatus } from "../core/getMeta.js";
import { getChapter } from "../core/getChapter.js";
import { generateFileBaseName } from "../utils/generateFileName.js";

import { epubCss } from "./epubCss.js";
import { buildTitlePage, buildChapterPage, buildTocXhtml } from "./epubTemplates.js";
import { buildOpf } from "./epubOpf.js";
import { buildNcx } from "./epubNcx.js";

export async function createEPUB() {
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
    const mainAuthor = authors[0];
    const coauthors = authors.slice(1).map(a => a.name).join(", ");

    const { fandom, size, tags, description, notes, otherPublication } = getExtraData();
    const { direction, rating, status } = getDirectionRatingStatus();

    // ---------- СБОР ГЛАВ ----------
    const chaptersNodes = document.querySelectorAll(".list-of-fanfic-parts .part-link");
    const chapters = [];
    let index = 1;

    for (let chapter of chaptersNodes) {
        let { title: chTitle, xhtml } = await getChapter(chapter.href);
        chapters.push({
            id: `chapter${index}`,
            file: `chapter${index}.xhtml`,
            title: chTitle,
            content: xhtml
        });
        index++;
    }

    const zip = new JSZip();

    // mimetype
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

    // META-INF/container.xml
    zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0"
    xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf"
            media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`);

    // CSS
    zip.file("OEBPS/style.css", epubCss.trim());

    // Title page
    zip.file("OEBPS/titlepage.xhtml", buildTitlePage({
        title,
        mainAuthor,
        coauthors,
        direction,
        rating,
        size,
        status,
        tags,
        description,
        notes,
        otherPublication
    }));

    // Chapters
    chapters.forEach(ch => {
        zip.file(`OEBPS/${ch.file}`, buildChapterPage(ch));
    });

    // TOC XHTML
    zip.file("OEBPS/toc.xhtml", buildTocXhtml(chapters));

    // content.opf
    zip.file("OEBPS/content.opf", buildOpf({
        title,
        mainAuthor,
        description,
        chapters
    }));

    // toc.ncx
    zip.file("OEBPS/toc.ncx", buildNcx(title, chapters));

    // ---------- Генерация EPUB ----------
    const baseName = generateFileBaseName(mainAuthor.name, title);
    const fileName = `${baseName}.epub`;

    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}
