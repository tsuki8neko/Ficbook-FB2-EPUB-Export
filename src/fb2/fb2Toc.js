/**
 * Формирует оглавление FB2-книги.
 * Каждая глава превращается в ссылку вида:
 * <a xlink:href="#id">Название</a>
 * Это позволяет навигацию внутри FB2-файла.
 */

export function buildFb2Toc(tocEntries) {
    return `
<body name="toc">
    <section>
        <title><p>Оглавление</p></title>
        ${tocEntries.map(ch => `
        <p><a xlink:href="#${ch.id}">${ch.title}</a></p>
        `).join("")}
    </section>
</body>
`;
}
