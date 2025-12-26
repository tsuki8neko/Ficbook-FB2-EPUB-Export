import { escapeXml } from "../utils/escapeXml.js";

export function buildOpf({ title, mainAuthor, description, chapters }) {
    const now = new Date();
    const isoDate = now.toISOString().split("T")[0];

    const manifest = [
        `<item id="css" href="style.css" media-type="text/css"/>`,
        `<item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>`,
        `<item id="toc" href="toc.xhtml" media-type="application/xhtml+xml"/>`,
        ...chapters.map(ch =>
            `<item id="${ch.id}" href="${ch.file}" media-type="application/xhtml+xml"/>`
        ),
        `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`
    ].join("\n        ");

    const spine = [
        `<itemref idref="titlepage"/>`,
        `<itemref idref="toc"/>`,
        ...chapters.map(ch => `<itemref idref="${ch.id}"/>`)
    ].join("\n        ");

    return `
<?xml version="1.0" encoding="utf-8"?>
<package version="2.0"
    xmlns="http://www.idpf.org/2007/opf"
    unique-identifier="BookId">

        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:title>${escapeXml(title)}</dc:title>
            <dc:creator>${escapeXml(mainAuthor.name)}</dc:creator>
            <dc:language>ru</dc:language>
            <dc:identifier id="BookId">urn:uuid:${Date.now()}</dc:identifier>
            <dc:date>${isoDate}</dc:date>
            <dc:subject>fiction</dc:subject>
            <dc:description>${escapeXml(description.slice(0, 500))}</dc:description>
            <meta name="source" content="${escapeXml(location.href)}"/>
        </metadata>
        <manifest>
            ${manifest}
        </manifest>
        <spine toc="ncx">
            ${spine}
        </spine>
    </package>
`.trim();
}
