/**
 * fb2Body Формирует тело FB2-книги.
 * Вставляется уже готовая разметка глав (fb2Chapters),
 * которая была собрана ранее из парсинга текста.
 */

export function buildFb2Body(fb2Chapters) {
    return `
<body>
${fb2Chapters}
</body>
`;
}
