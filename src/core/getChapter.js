import { delay } from "../utils/delay.js";
import { extractFootnotes } from "./getFootnotes.js";

/**
 * Загружает и парсит одну главу.
 *
 *   Функция возвращает:
 *   title   — заголовок главы
 *   plain   — чистый текст без HTML
 *   xhtml   — очищенный HTML, готовый для FB2/EPUB
 *   footnotes — массив сносок
 */

export async function getChapter(url, attempt = 1) {
    const MAX_ATTEMPTS = 7;

    // Небольшая задержка перед запросом
    await delay(500 + Math.random() * 300);

    let res;
    try {
        // Пробуем загрузить страницу главы
        res = await fetch(url);
    } catch (e) {
        if (attempt < MAX_ATTEMPTS) {
            // Если ошибка сети — пробуем снова с увеличением задержки
            await delay(1000 * attempt);
            return getChapter(url, attempt + 1);
        }
        throw e;
    }

    let html = await res.text();

    // Проверяем, не вернул ли сайт пустой/ошибочный HTML
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
            // Увеличиваем задержку и пробуем снова
            await delay(1200 * attempt + Math.random() * 500);
            return getChapter(url, attempt + 1);
        }
        throw new Error(`Не удалось загрузить ${url}: пустой HTML`);
    }

    // --- Парсим HTML ---
    let doc = new DOMParser().parseFromString(html, "text/html");

    // Заголовок главы
    let title =
        doc.querySelector(".title-area h2, .part-title h3")?.innerText.trim() ||
        "Глава";

    // Удаляем лишние элементы, которые не должны попадать в текст
    doc.querySelectorAll(".part-date, .part-info").forEach(el => el.remove());

    // Основной контейнер текста главы
    let contentNode =
        doc.querySelector("#part_content") ||
        doc.querySelector("#content.js-part-text, #content.part_text, #content");

    if (contentNode) {
        // Удаляем рекламу, футеры, кнопки, настройки текста и прочий мусор
        contentNode.querySelectorAll(
            ".js-collapsible, .js-text-settings-collapse-button, .ad, .part-footer, .chapter-time, .text_settings, .tags"
        ).forEach(el => el.remove());

        // Иногда сайт вставляет заголовок внутри текста — убираем
        contentNode.querySelector("h1, h2, h3")?.remove();
    }
    // Чистый текст без HTML
    let plain = contentNode ? contentNode.innerText.trim() : "";

    if (!plain) {
        if (attempt < MAX_ATTEMPTS) {
            await delay(1200 * attempt + Math.random() * 500);
            return getChapter(url, attempt + 1);
        }
        throw new Error(`Не удалось загрузить ${url}: контент пустой`);
    }

    // --- Извлекаем карту сносок из JS-переменной textFootnotes ---
    const footnotesMatch = html.match(/\s+textFootnotes\s*=\s*({.*?})/);
    const notesMap = footnotesMatch ? JSON.parse(footnotesMatch[1]) : {};

    // --- Извлекаем сноски и заменяем ссылки в тексте ---
    const footnotes = extractFootnotes(doc, contentNode, notesMap);

    /**
     * Превращает двойные переносы в параграфы <p>,
     * но НЕ оборачивает блоки, которые уже являются HTML‑структурой.
     */
    function paragraphs(html) {
        html = html.replace(/\r/g, "");
        html = html.replace(/<br\s*\/?>/gi, "\n");

        const rawBlocks = html
            .split(/\n\s*\n+/) // двойные переносы → блоки
            .map(b => b.trim())
            .filter(b => b.length > 0);

        return rawBlocks
            .map(block => {
                // Если блок начинается с блочного тега — НЕ оборачиваем
                if (/^<\/?(div|section|title|h1|h2|h3|ul|ol|li|table|tr|td)\b/i.test(block)) {
                    return block;
                }

                // Если внутри блока есть блочные теги — НЕ оборачиваем
                if (/<\/?(div|section|title|p|h1|h2|h3|ul|ol|li|table|tr|td)\b/i.test(block)) {
                    return block;
                }

                // Обычный текст → оборачиваем в <p>
                return `<p>${block}</p>`;
            })
            .join("\n");
    }

    // XHTML‑версия текста главы
    let xhtml = paragraphs(contentNode.innerHTML.trim());

    // ---------------------------------------------------------
    //  ДОБАВЛЯЕМ РАЗДЕЛИТЕЛИ ДЛЯ ПРИМЕЧАНИЙ
    // ---------------------------------------------------------

    // Примечания перед текстом
    const topNotes = doc.querySelector(".part-comment-top");
    if (topNotes) {
        xhtml = xhtml.replace(
            /(<div class="part-comment-top"[\s\S]*?<\/div>)/,
            `$1\n<p>--------------</p>`
        );
    }

    // Примечания после текста
    const bottomNotes = doc.querySelector(".part-comment-bottom");
    if (bottomNotes) {
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
