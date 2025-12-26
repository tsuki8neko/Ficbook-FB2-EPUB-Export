import { textToParagraphs } from "../utils/textToParagraphs.js";

export async function getChapter(url) {
    let res = await fetch(url);
    let html = await res.text();
    let doc = new DOMParser().parseFromString(html, "text/html");

    let title = doc.querySelector(".title-area h2, .part-title h3")?.innerText.trim() || "Глава";

    let contentNode = doc.querySelector("#part_content");
    if (contentNode) {
        contentNode.querySelectorAll(
            ".js-collapsible, .js-text-settings-collapse-button, .ad, .part-footer, .chapter-time, .text_settings, .tags"
        ).forEach(el => el.remove());

        contentNode.querySelector("h1, h2, h3")?.remove();
    }

    let content = contentNode ? contentNode.innerText : "";

    return {
        title,
        plain: content.trim(),
        xhtml: textToParagraphs(content)
    };
}
