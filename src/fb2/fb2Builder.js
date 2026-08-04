import { collectBook } from "../core/collectBook.js";
import { escapeXml } from "../utils/escapeXml.js";
import { generateFileBaseName } from "../utils/generateFileName.js";
import { downloadBlob } from "../utils/download.js";
import { createBookId } from "../utils/id.js";
import { buildFb2Header } from "./fb2Header.js";
import { buildFb2Toc } from "./fb2Toc.js";
import { buildFb2Body } from "./fb2Body.js";

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

export async function createFB2(onProgress = () => {}, isCancelled = () => false) {
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
