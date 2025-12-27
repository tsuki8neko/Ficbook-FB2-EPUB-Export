import { textToParagraphs } from "../utils/textToParagraphs.js";

export async function getChapter(url) {
    let res = await fetch(url);
    let html = await res.text();
    let doc = new DOMParser().parseFromString(html, "text/html");

    let title = doc.querySelector(".title-area h2, .part-title h3")?.innerText.trim() || "Глава";

    // Удаляем дату на странице главы
    doc.querySelectorAll(".part-date").forEach(el => el.remove());

    // Удаляем дату и отзывы на странице содержания
    doc.querySelectorAll(".part-info").forEach(el => el.remove());

    let contentNode = doc.querySelector("#part_content");
    if (contentNode) {

        // Удаляем служебные элементы внутри текста
        contentNode.querySelectorAll(
            ".js-collapsible, .js-text-settings-collapse-button, .ad, .part-footer, .chapter-time, .text_settings, .tags"
        ).forEach(el => el.remove());

        // Удаляем заголовки внутри текста
        contentNode.querySelector("h1, h2, h3")?.remove();
    }

    let content = contentNode ? contentNode.innerText : "";

    return {
        title,
        plain: content.trim(),
        xhtml: textToParagraphs(content)
    };
}
