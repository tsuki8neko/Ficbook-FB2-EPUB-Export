/**
 * getChapter.js
 *
 * Возвращает:
 *  title     — заголовок главы
 *  plain     — чистый текст
 *  xhtml     — XHTML для FB2/EPUB
 *  footnotes — сноски
 */

import { delay } from "../utils/delay.js";
import { extractFootnotes } from "./getFootnotes.js";

const MAX_ATTEMPTS = 7;

export async function getChapter(url, attempt = 1) {
    await delay(400 + Math.random() * 300);

    let res;
    try {
        res = await fetch(url, { credentials: "same-origin" });
    } catch (e) {
        if (attempt < MAX_ATTEMPTS) {
            await delay(1000 * attempt);
            return getChapter(url, attempt + 1);
        }
        throw e;
    }

    const html = await res.text();

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

    const doc = new DOMParser().parseFromString(html, "text/html");

    // -----------------------------
    // Заголовок
    // -----------------------------
    const title =
        doc.querySelector(".title-area h2, .part-title h3, .part-title h2, .part-title")?.textContent.trim() ||
        "Глава";

    // -----------------------------
    // Основной текст
    // -----------------------------
    let contentNode =
        doc.querySelector(".part_text") ||
        doc.querySelector("#content .part_text") ||
        doc.querySelector("[itemprop='articleBody']") ||
        null;

    // fallback — ищем самый большой текстовый блок
    if (!contentNode) {
        let best = null;
        let bestScore = 0;

        const blocks = doc.querySelectorAll("div, article, section");
        for (const el of blocks) {
            const text = (el.textContent || "").replace(/\s+/g, " ").trim();
            if (text.length < 200) continue;

            const cls = el.className || "";
            if (/header|footer|menu|nav|comment|promo|settings|captcha/i.test(cls)) continue;

            if (text.length > bestScore) {
                bestScore = text.length;
                best = el;
            }
        }

        contentNode = best;
    }

    if (!contentNode) {
        throw new Error(`Не найден текст главы: ${url}`);
    }

    // -----------------------------
    // Чистка мусора
    // -----------------------------
    contentNode.querySelectorAll(`
        .js-text-settings,
        .js-text-settings-collapse-button,
        .text_settings,
        .text-settings,
        .text-settings-panel,
        .fanfic-text-promo,
        .copy-button,
        .ad,
        .promo,
        .chapter-time
    `.replace(/\s+/g, " ")).forEach(el => el.remove());

    // -----------------------------
    // Плоский текст
    // -----------------------------
    const plain = (contentNode.textContent || "")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .trim();

    // -----------------------------
    // Сноски
    // -----------------------------
    const footnotesMatch = html.match(/\s+textFootnotes\s*=\s*({.*?})/);
    const notesMap = footnotesMatch ? JSON.parse(footnotesMatch[1]) : {};
    const footnotes = extractFootnotes(doc, contentNode, notesMap);

    // -----------------------------
    // XHTML (простая, но чистая)
    // -----------------------------
    function buildXhtml(node) {
        const blocks = [];

        const push = (txt) => {
            const t = txt.trim();
            if (t) blocks.push(`<p>${t}</p>`);
        };

        const processText = (text) => {
            // нормализуем пробелы
            text = text.replace(/\u00a0/g, " ");

            // разбиваем по переносам строк
            const lines = text.split(/\n+/);

            for (let line of lines) {
                line = line.trim();
                if (!line) continue;

                // если строка начинается с "—", делаем отдельный абзац
                if (/^—\s*/.test(line)) {
                    push(line);
                    continue;
                }

                push(line);
            }
        };

        const walk = (n) => {
            if (!n) return;

            if (n.nodeType === Node.TEXT_NODE) {
                processText(n.nodeValue);
                return;
            }

            if (n.nodeType !== Node.ELEMENT_NODE) return;

            const tag = n.tagName.toLowerCase();

            if (tag === "br") {
                blocks.push(`<p></p>`);
                return;
            }

            if (["p", "div", "section", "article"].includes(tag)) {
                const html = n.innerHTML
                    .replace(/<br\s*\/?>/gi, "\n")
                    .replace(/<\/p>/gi, "\n");

                processText(html);
                return;
            }

            n.childNodes.forEach(walk);
        };

        walk(node);

        return blocks.join("\n");
    }


    const xhtml = buildXhtml(contentNode);

    return {
        title,
        plain,
        xhtml,
        footnotes
    };
}

