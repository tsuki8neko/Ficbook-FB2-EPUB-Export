import { textToParagraphs } from "../utils/textToParagraphs.js";
import { delay } from "../utils/delay.js";

export async function getChapter(url, attempt = 1) {
    const MAX_ATTEMPTS = 7; // Количество попыток повторного скачивания главы

    let res;
    try {
        res = await fetch(url);
    } catch (e) {
        console.warn(`Ошибка сети при загрузке ${url}: ${e}`);
        if (attempt < MAX_ATTEMPTS) {
            await delay(1000 * attempt);
            return getChapter(url, attempt + 1);
        }
        throw e;
    }

    let html = await res.text();

    // --- Универсальная проверка на пустой/битый HTML ---
    const looksEmpty =
        !html ||
        html.length < 500 ||
        html.includes("cf-browser-verification") ||
        html.includes("Cloudflare") ||
        html.includes("Too Many Requests") ||
        html.includes("<title>429") ||
        html.includes("<title>502");

    if (looksEmpty) {
        console.warn(`Пустой HTML — попытка ${attempt}/${MAX_ATTEMPTS}`);

        if (attempt < MAX_ATTEMPTS) {
            await delay(1200 * attempt + Math.random() * 500);
            return getChapter(url, attempt + 1);
        }

        throw new Error(`Не удалось загрузить ${url}: пустой HTML`);
    }

    let doc = new DOMParser().parseFromString(html, "text/html");

    let title = doc.querySelector(".title-area h2, .part-title h3")?.innerText.trim() || "Глава";

    // Удаляем дату на странице главы
    doc.querySelectorAll(".part-date").forEach(el => el.remove());

    // Удаляем дату и отзывы на странице содержания
    doc.querySelectorAll(".part-info").forEach(el => el.remove());

    // Для многочастных фанфиков
    let contentNode = doc.querySelector("#part_content");

    // Для одноглавных фанфиков (нет оглавления)
    if (!contentNode) {
        contentNode = doc.querySelector("#content.js-part-text, #content.part_text, #content");
    }

    if (contentNode) {
        contentNode.querySelectorAll(
            ".js-collapsible, .js-text-settings-collapse-button, .ad, .part-footer, .chapter-time, .text_settings, .tags"
        ).forEach(el => el.remove());

        contentNode.querySelector("h1, h2, h3")?.remove();
    }

    let content = contentNode ? contentNode.innerText.trim() : "";

    // --- Проверка: глава пустая ---
    if (!content) {
        console.warn(`Контент пустой — попытка ${attempt}/${MAX_ATTEMPTS}`);

        if (attempt < MAX_ATTEMPTS) {
            await delay(1200 * attempt + Math.random() * 500);
            return getChapter(url, attempt + 1);
        }

        throw new Error(`Не удалось загрузить ${url}: контент пустой`);
    }

    return {
        title,
        plain: content,
        xhtml: textToParagraphs(content)
    };
}
