import { collectBook } from "../core/collectBook.js";
import { escapeXml } from "../utils/escapeXml.js";
import { generateFileBaseName } from "../utils/generateFileName.js";
import { downloadBlob } from "../utils/download.js";
import { createBookId } from "../utils/id.js";
import "../utils/jszipSchedulerShim.js";
import JSZip from "jszip";
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

function cancelledError() {
    return new Error("cancelled");
}

function waitForZip(promise, isCancelled, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
        let settled = false;
        let cancelTimer = null;
        let timeoutTimer = null;

        const cleanup = () => {
            if (cancelTimer !== null) clearInterval(cancelTimer);
            if (timeoutTimer !== null) clearTimeout(timeoutTimer);
        };

        const finish = (fn, value) => {
            if (settled) return;
            settled = true;
            cleanup();
            fn(value);
        };

        cancelTimer = setInterval(() => {
            if (isCancelled()) finish(reject, cancelledError());
        }, 100);

        timeoutTimer = setTimeout(() => {
            finish(reject, new Error(`JSZip не завершил упаковку EPUB за ${Math.round(timeoutMs / 1000)} секунд.`));
        }, timeoutMs);

        Promise.resolve(promise).then(
            value => finish(resolve, value),
            error => finish(reject, error)
        );
    });
}

export async function createEPUB(onProgress = () => {}, isCancelled = () => false, options = {}) {
    const book = await collectBook(onProgress, isCancelled, { ...options, coverMode: "epub" });
    if (isCancelled()) throw cancelledError();

    options.onStage?.("Создание EPUB…");
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

    console.info(
        `[Ficbook Exporter] EPUB: к упаковке — ${chapters.length} глав, ` +
        `${chapters.reduce((sum, chapter) => sum + (chapter.content?.length || 0), 0)} символов, ` +
        `${cover ? "с обложкой" : "без обложки"}`
    );

    const started = performance.now();
    let lastShownPercent = -1;
    const generatePromise = zip.generateAsync(
        {
            type: "blob",
            mimeType: "application/epub+zip",
            compression: "DEFLATE",
            compressionOptions: { level: 6 }
        },
        metaInfo => {
            if (isCancelled()) return;
            const percent = Math.max(0, Math.min(100, Math.floor(metaInfo?.percent || 0)));
            if (percent !== lastShownPercent) {
                lastShownPercent = percent;
                options.onStage?.(`Сборка ${percent}%`);
            }
        }
    );

    const blob = await waitForZip(generatePromise, isCancelled, 60000);
    if (isCancelled()) throw cancelledError();

    console.info(
        `[Ficbook Exporter] EPUB: упаковка ZIP — ${Math.round(performance.now() - started)} мс, ` +
        `${blob.size} байт`
    );

    const translator = meta.translators?.[0]?.name;
    const titlePart = translator ? `${meta.title}_[${translator}]` : meta.title;
    const fileName = `${generateFileBaseName(meta.mainAuthor?.name || "UnknownAuthor", titlePart)}.epub`;
    downloadBlob(blob, fileName);
}
