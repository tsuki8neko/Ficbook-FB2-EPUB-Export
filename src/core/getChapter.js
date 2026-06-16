/**
 * getChapter.js Загружает и парсит одну главу.
 *
 * Возвращает:
 *  title     — заголовок главы
 *  plain     — чистый текст
 *  xhtml     — XHTML для FB2/EPUB
 *  footnotes — сноски
 */

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

    const doc = new DOMParser().parseFromString(html, "text/html");

    const title =
        doc.querySelector(".title-area h2, .part-title h3")?.innerText.trim() ||
        "Глава";

    doc.querySelectorAll(".part-date, .part-info").forEach(el => el.remove());

    let contentNode =
        doc.querySelector("#part_content") ||
        doc.querySelector("#content.js-part-text, #content.part_text, #content");

    if (!contentNode) {
        throw new Error("Не найден contentNode");
    }

    contentNode.querySelectorAll(
        ".js-collapsible, .js-text-settings-collapse-button, .ad, .part-footer, .chapter-time, .text_settings, .tags, .fanfic-text-promo"
    ).forEach(el => el.remove());

    contentNode.querySelectorAll("h1,h2,h3").forEach(el => el.remove());

    const plain = contentNode.innerText.trim();

    if (!plain) {
        if (attempt < MAX_ATTEMPTS) {
            await delay(1200 * attempt + Math.random() * 500);
            return getChapter(url, attempt + 1);
        }
        throw new Error(`Не удалось загрузить ${url}: контент пустой`);
    }

    const footnotesMatch = html.match(/\s+textFootnotes\s*=\s*({.*?})/);
    const notesMap = footnotesMatch ? JSON.parse(footnotesMatch[1]) : {};

    const footnotes = extractFootnotes(doc, contentNode, notesMap);

    // =========================================================
    // FIXED XHTML
    // =========================================================

    function normalizeText(text) {
        return text
            .replace(/\u00a0/g, " ")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    function buildXhtmlFromDom(node) {
        const blocks = [];

        const flushText = (text) => {
            const cleaned = text
                .replace(/\u00a0/g, " ")
                .replace(/\s+/g, " ")
                .trim();

            if (cleaned) {
                blocks.push(`<p>${cleaned}</p>`);
            }
        };

        const walkInline = (el) => {
            let text = "";

            const walk = (n) => {
                if (!n) return;

                if (n.nodeType === Node.TEXT_NODE) {
                    text += n.textContent;
                    return;
                }

                if (n.nodeType !== Node.ELEMENT_NODE) return;

                const tag = n.tagName.toLowerCase();

                if (tag === "br") {
                    text += "\n";
                    return;
                }

                if (tag === "footnote-ref") {
                    text += n.outerHTML;
                    return;
                }

                n.childNodes.forEach(walk);
            };

            el.childNodes.forEach(walk);

            //  РАЗБИЕНИЕ АБЗАЦОВ
            text.split(/\n+/).forEach(part => {
                flushText(part);
            });
        };

        const walk = (el) => {
            if (!el || el.nodeType !== Node.ELEMENT_NODE) return;

            const tag = el.tagName.toLowerCase();

            if (el.classList?.contains("fanfic-text-promo")) return;

            //  p = абзац
            if (tag === "p") {
                walkInline(el);
                return;
            }

            //  div = НЕ всегда абзац, но часто контейнер главы
            if (tag === "div") {
                const hasParagraphs = el.querySelector("p");

                if (hasParagraphs) {
                    el.querySelectorAll("p").forEach(walk);
                } else {
                    walkInline(el);
                }
                return;
            }

            el.childNodes.forEach(walk);
        };

        node.childNodes.forEach(walk);

        return blocks.join("\n");
    }

    const xhtml = buildXhtmlFromDom(contentNode);

    return {
        title,
        plain,
        xhtml,
        footnotes
    };
}