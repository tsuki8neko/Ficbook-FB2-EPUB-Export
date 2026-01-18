import { escapeXml } from "../utils/escapeXml.js";

export function buildNcx(title, chapters) {
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
        <meta name="dtb:uid" content="urn:uuid:${Date.now()}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>${escapeXml(title)}</text>
    </docTitle>
    <navMap>
        <navPoint id="navPoint-1" playOrder="1">
            <navLabel><text>Оглавление</text></navLabel>
            <content src="toc.xhtml"/>
        </navPoint>
        ${navPoints}
    </navMap>
</ncx>
`.trim();
}
