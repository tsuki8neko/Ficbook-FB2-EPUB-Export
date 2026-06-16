/**
 * getFootnotes. js
 * Извлекает сноски из текста главы и формирует единый список примечаний.
 *
 * span.footnote → превращаем в <footnote-ref>
 * но БЕЗ outerHTML (чтобы не ломать DOM структуру)
 */

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

        // ❗ ВАЖНО: НЕ outerHTML
        // просто превращаем элемент в "placeholder"
        const ref = doc.createElement("footnote-ref");
        ref.setAttribute("id", id);
        ref.setAttribute("number", number);

        anchor.replaceWith(ref);

        notes.push({
            id,
            number,
            html: fixHtml(text)
        });
    });

    return notes;
}