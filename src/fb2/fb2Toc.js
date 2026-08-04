import { escapeXml } from "../utils/escapeXml.js";

export function buildFb2Toc(tocEntries) {
    return `
<body name="toc">
    <section>
        <title><p>Оглавление</p></title>
        ${tocEntries.map(ch => `<p><a xlink:href="#${escapeXml(ch.id)}">${escapeXml(ch.title)}</a></p>`).join("\n")}
    </section>
</body>
`;
}
