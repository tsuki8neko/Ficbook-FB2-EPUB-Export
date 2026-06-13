import { delay } from "../utils/delay.js";
import { extractFootnotes } from "./getFootnotes.js";

export async function getChapter(url, attempt = 1) {
    const MAX_ATTEMPTS = 7;

    await delay(500 + Math.random() * 300);

    let res;
    try {
        res = await fetch(url);
    } catch (e) {
        if (attempt < MAX_ATTEMPTS) {
            await delay(1000 * attempt);
            return getChapter(url, attempt + 1);
        }
        throw e;
    }

    let html = await res.text();

    const looksEmpty =
        !html ||
        html.length < 500 ||
        html.includes("cf-browser-verification") ||
        html.includes("Cloudflare") ||
        html.includes("Too Many Requests") ||
        html.includes("<title>429") ||
        html.includes("<title>502");

    if (looksEmpty) {
        if (attempt < MAX_ATTEMPTS) {
            await delay(1200 * attempt + Math.random() * 500);
            return getChapter(url, attempt + 1);
        }
        throw new Error(`Не удалось загрузить ${url}: пустой HTML`);
    }

    // --- Парсим HTML ---
    let doc = new DOMParser().parseFromString(html, "text/html");

    let title =
        doc.querySelector(".title-area h2, .part-title h3")?.innerText.trim() ||
        "Глава";

    // Убираем мусор
    doc.querySelectorAll(".part-date, .part-info").forEach(el => el.remove());

    let contentNode =
        doc.querySelector("#part_content") ||
        doc.querySelector("#content.js-part-text, #content.part_text, #content");

    if (contentNode) {
        contentNode.querySelectorAll(
            ".js-collapsible, .js-text-settings-collapse-button, .ad, .part-footer, .chapter-time, .text_settings, .tags"
        ).forEach(el => el.remove());

        contentNode.querySelector("h1, h2, h3")?.remove();
    }

    let plain = contentNode ? contentNode.innerText.trim() : "";

    if (!plain) {
        if (attempt < MAX_ATTEMPTS) {
            await delay(1200 * attempt + Math.random() * 500);
            return getChapter(url, attempt + 1);
        }
        throw new Error(`Не удалось загрузить ${url}: контент пустой`);
    }

    // --- ВАЖНО: извлекаем textFootnotes из HTML ---
    const footnotesMatch = html.match(/\s+textFootnotes\s*=\s*({.*?})/);
    const notesMap = footnotesMatch ? JSON.parse(footnotesMatch[1]) : {};

    // --- Извлечение сносок (меняет contentNode.innerHTML) ---
    const footnotes = extractFootnotes(doc, contentNode, notesMap);

    // --- Превращаем двойные переносы в <p>, но осторожно ---
    function paragraphs(html) {
        html = html.replace(/\r/g, "");
        html = html.replace(/<br\s*\/?>/gi, "\n");

        const rawBlocks = html
            .split(/\n\s*\n+/)
            .map(b => b.trim())
            .filter(b => b.length > 0);

        return rawBlocks
            .map(block => {
                // 1. Если блок начинается с блочного тега — НЕ оборачиваем
                if (/^<\/?(div|section|title|h1|h2|h3|ul|ol|li|table|tr|td)\b/i.test(block)) {
                    return block;
                }

                // 2. Если внутри блока есть блочные теги — НЕ оборачиваем
                if (/<\/?(div|section|title|p|h1|h2|h3|ul|ol|li|table|tr|td)\b/i.test(block)) {
                    return block;
                }

                // 3. Обычный текст → <p>
                return `<p>${block}</p>`;
            })
            .join("\n");
    }




    let xhtml = paragraphs(contentNode.innerHTML.trim());

    // ---------------------------------------------------------
    //  ДОБАВЛЯЕМ РАЗДЕЛИТЕЛИ ДЛЯ ПРИМЕЧАНИЙ
    // ---------------------------------------------------------

    // Примечания перед текстом
    // Примечания перед текстом
    const topNotes = doc.querySelector(".part-comment-top");
    if (topNotes) {
        // Разделитель должен быть ПОСЛЕ примечаний
        xhtml = xhtml.replace(
            /(<div class="part-comment-top"[\s\S]*?<\/div>)/,
            `$1\n<p>--------------</p>`
        );
    }

    // Примечания после текста
    const bottomNotes = doc.querySelector(".part-comment-bottom");
    if (bottomNotes) {
        // Разделитель должен быть ПЕРЕД примечаниями
        xhtml = xhtml.replace(
            /(<div class="part-comment-bottom"[\s\S]*?<\/div>)/,
            `<p>--------------</p>\n$1`
        );
    }

    return {
        title,
        plain,
        xhtml,
        footnotes
    };
}
