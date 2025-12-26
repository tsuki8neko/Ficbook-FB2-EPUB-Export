export function buildFb2Body(fb2Chapters) {
    return `
<body>
${fb2Chapters}
</body>
</FictionBook>
`;
}
