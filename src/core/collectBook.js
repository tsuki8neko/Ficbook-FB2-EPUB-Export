import { getTitle } from "./getTitle.js";
import { getAuthors } from "./getAuthors.js";
import { getExtraData, getDirectionRatingStatus, getOriginalAuthor, getOriginalWork } from "./getMeta.js";
import { getChapter } from "./getChapter.js";
import { getCover } from "./getCover.js";
import { delay } from "../utils/delay.js";

function currentWorkUrl() {
    const url = new URL(location.href);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "readfic" || !parts[1]) throw new Error("Откройте страницу произведения или главы Ficbook.");
    return new URL(`/readfic/${parts[1]}`, url.origin).href;
}

async function loadWorkDocument(workUrl) {
    const current = new URL(location.href);
    const work = new URL(workUrl);
    if (current.pathname.replace(/\/$/, "") === work.pathname.replace(/\/$/, "")) return document;

    const response = await fetch(workUrl, { credentials: "same-origin" });
    if (!response.ok) throw new Error(`Не удалось загрузить страницу произведения: HTTP ${response.status}`);
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc.querySelector(".fanfic-hat-body, h1.heading")) {
        throw new Error("Страница произведения загружена, но её структура не распознана.");
    }
    return doc;
}

function isRole(author, role) {
    return author.role === role;
}

function extractSeries(doc) {
    const link = doc.querySelector(".mb-10 a[href^='/series/']");
    if (!link) return null;
    return {
        name: link.textContent?.trim() || "",
        url: new URL(link.getAttribute("href"), location.origin && location.origin !== "null" ? location.origin : "https://ficbook.net").href
    };
}

function extractChapterUrls(doc, workUrl) {
    const urls = Array.from(doc.querySelectorAll(".list-of-fanfic-parts .part-link"))
        .map(link => link.getAttribute("href") || link.href || "")
        .filter(Boolean)
        .map(href => new URL(href, workUrl).href.split("#")[0])
        .filter(href => {
            if (href.includes("/all-parts")) return false;
            const last = new URL(href).pathname.split("/").filter(Boolean).pop();
            return /^\d+$/.test(last || "");
        });

    return [...new Set(urls.length ? urls : [workUrl])];
}

async function loadChapters(urls, onProgress, isCancelled) {
    const results = new Array(urls.length).fill(null);
    let pending = urls.map((_, index) => index);
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts && pending.length; attempt++) {
        const failed = [];

        for (const index of pending) {
            if (isCancelled()) throw new Error("cancelled");
            onProgress(index + 1, urls.length);

            if (attempt > 1) await delay(700 + Math.random() * 500);

            try {
                results[index] = {
                    ...(await getChapter(urls[index], { isCancelled })),
                    url: urls[index],
                    number: index + 1
                };
            } catch (error) {
                if (error.message === "cancelled") throw error;
                console.warn(
                    `Не удалось загрузить главу (попытка ${attempt}/${maxAttempts}):`,
                    urls[index],
                    error
                );
                failed.push(index);
            }
        }

        pending = failed;
    }

    if (pending.length) {
        const failedLines = pending
            .map(index => `${index + 1}. ${urls[index]}`)
            .join("\n");
        const error = new Error(
            `Не удалось загрузить ${pending.length} из ${urls.length} глав после трёх попыток.\n\n` +
            "Файл не создан, чтобы не сохранять неполный текст. Повторите экспорт позже.\n\n" +
            `Проблемные главы:\n${failedLines}`
        );
        error.name = "IncompleteBookError";
        error.failedUrls = pending.map(index => urls[index]);
        throw error;
    }

    return results;
}

export async function collectBook(onProgress = () => {}, isCancelled = () => false) {
    const workUrl = currentWorkUrl();
    const doc = await loadWorkDocument(workUrl);

    const title = getTitle(doc);
    const authors = getAuthors(doc);
    const originalAuthor = getOriginalAuthor(doc);
    const originalWork = getOriginalWork(doc);
    const translators = authors.filter(author => isRole(author, "переводчик"));
    const mainAuthor = authors.find(author => isRole(author, "автор")) || originalAuthor || translators[0] || null;

    if (!mainAuthor) throw new Error("Автор не найден. Возможно, Ficbook изменил разметку страницы.");

    const meta = {
        title,
        authors,
        mainAuthor,
        coauthors: authors.filter(author => isRole(author, "соавтор")),
        translators,
        betas: authors.filter(author => isRole(author, "бета")),
        gammas: authors.filter(author => isRole(author, "гамма")),
        originalAuthor,
        originalWork,
        ...getExtraData(doc),
        ...getDirectionRatingStatus(doc),
        series: extractSeries(doc),
        sourceUrl: workUrl
    };

    const cover = await getCover(doc);
    if (isCancelled()) throw new Error("cancelled");
    const chapterUrls = extractChapterUrls(doc, workUrl);
    const chapters = await loadChapters(chapterUrls, onProgress, isCancelled);

    if (!chapters.length) throw new Error("Не удалось загрузить главы произведения.");
    return { meta, cover, chapters };
}
