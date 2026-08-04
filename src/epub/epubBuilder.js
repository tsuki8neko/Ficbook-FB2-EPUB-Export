import { collectBook } from "../core/collectBook.js";
import { escapeXml } from "../utils/escapeXml.js";
import { generateFileBaseName } from "../utils/generateFileName.js";
import { downloadBlob } from "../utils/download.js";
import { createBookId } from "../utils/id.js";
import { loadExternalScript } from "../utils/loadLibrary.js";
import { epubCss } from "./epubCss.js";
import { buildTitlePage, buildChapterPage, buildTocXhtml } from "./epubTemplates.js";
import { buildOpf } from "./epubOpf.js";
import { buildNcx } from "./epubNcx.js";

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderEpubFootnotes(chapter) {
    let content = chapter.xhtml;
    const notes = [];

    for (const note of chapter.footnotes || []) {
        const id = `fn_${chapter.number}_${note.id}`;
        const pattern = new RegExp(
            `<footnote-ref[^>]*id=["']${escapeRegExp(note.id)}["'][^>]*>(?:<\\/footnote-ref>)?`,
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

export async function createEPUB(onProgress = () => {}, isCancelled = () => false) {
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
