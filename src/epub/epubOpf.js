import { escapeXml } from "../utils/escapeXml.js";

function getSubjectTags(meta) {
    const tags = Array.isArray(meta?.tagSections)
        ? meta.tagSections.flatMap(section =>
            Array.isArray(section?.tags)
                ? section.tags
                : []
        )
        : [];

    const uniqueTags = [...new Set(
        tags
            .map(tag => String(tag || "").trim())
            .filter(Boolean)
    )];

    /*
     * Современные данные Ficbook хранят метки в tagSections, поэтому
     * каждый тег можно записать отдельным dc:subject. Для старых данных,
     * где есть только готовая строка meta.tags, сохраняем её одним subject,
     * чтобы не ломать обратную совместимость и не пытаться угадывать
     * разделитель внутри названия метки.
     */
    if (!uniqueTags.length && meta?.tags) {
        uniqueTags.push(String(meta.tags).trim());
    }

    return uniqueTags;
}

export function buildOpf({ meta, chapters, cover, bookId }) {
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

    const subjects = getSubjectTags(meta)
        .map(tag => `<dc:subject>${escapeXml(tag)}</dc:subject>`)
        .join("\n        ");

    return `<?xml version="1.0" encoding="utf-8"?>
<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${escapeXml(meta.title)}</dc:title>
        <dc:creator>${escapeXml(meta.mainAuthor?.name || "UnknownAuthor")}</dc:creator>
        <dc:language>ru</dc:language>
        <dc:identifier id="BookId">urn:uuid:${escapeXml(bookId)}</dc:identifier>
        <dc:date>${new Date().toISOString().split("T")[0]}</dc:date>
        ${subjects}
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
