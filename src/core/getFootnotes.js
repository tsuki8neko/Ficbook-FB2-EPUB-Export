// extractFootnotes.js

function fixHtml(html) {
    return html
        .replace(/<br>/g, "<br/>")
        .replace(/<hr>/g, "<hr/>")
        .replace(/&nbsp;/g, "&#160;");
}

export function extractFootnotes(doc, contentNode, notesMap = {}) {
    const anchors = [...contentNode.querySelectorAll("span.footnote[id]")];
    const notes = [];

    anchors.forEach((anchor, index) => {
        const id = anchor.id;
        const text = notesMap[id];
        if (!text) return;

        const number = index + 1;

        // Универсальный маркер
        anchor.outerHTML = `<footnote-ref id="${id}" number="${number}"/>`;

        notes.push({
            id,
            number,
            html: fixHtml(text)
        });
    });

    return notes;
}
