import { escapeXml } from "../utils/escapeXml.js";

export function buildNcx(title, chapters, bookId) {
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
