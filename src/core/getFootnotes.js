/**
 * Извлекает сноски из текста главы и формирует единый список примечаний.
 *
 * На сайте ссылки на сноски находятся в тексте как элементы
 * span.footnote, а сами тексты сносок приходят отдельно в объекте
 * textFootnotes. Функция связывает их между собой, заменяет ссылки
 * на универсальные маркеры и возвращает массив примечаний.
 * Приводит HTML сносок к XHTML-совместимому виду.
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

        // Сквозная нумерация сносок по порядку появления в тексте
        const number = index + 1;

        // Заменяем исходный HTML-элемент универсальным маркером
        anchor.outerHTML = `<footnote-ref id="${id}" number="${number}"/>`;

        notes.push({
            id,
            number,
            html: fixHtml(text)
        });
    });

    return notes;
}
