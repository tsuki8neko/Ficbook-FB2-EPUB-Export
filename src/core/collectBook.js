import { getTitle } from "./getTitle.js";
import { getAuthors } from "./getAuthors.js";
import { getExtraData, getDirectionRatingStatus, getOriginalAuthor, getOriginalWork } from "./getMeta.js";
import { getChapter } from "./getChapter.js";
import { getCover } from "./getCover.js";
import { delay } from "../utils/delay.js";
import { fetchTextWithRetries } from "../utils/network.js";

const workDocumentCache = new Map();

function currentWorkUrl() {
    const url = new URL(location.href);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "readfic" || !parts[1]) throw new Error("Откройте страницу произведения или главы Ficbook.");
    return new URL(`/readfic/${parts[1]}`, url.origin).href;
}

function normalizeRequestedWorkUrl(value) {
    const url = new URL(value, location.origin);
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.origin !== location.origin || parts[0] !== "readfic" || !parts[1]) {
        throw new Error("Некорректная ссылка на произведение Ficbook.");
    }
    return new URL(`/readfic/${parts[1]}`, url.origin).href;
}

async function loadWorkDocument(workUrl, options = {}) {
    const current = new URL(location.href);
    const work = new URL(workUrl);
    if (current.pathname.replace(/\/$/, "") === work.pathname.replace(/\/$/, "")) return document;

    if (!workDocumentCache.has(workUrl)) {
        workDocumentCache.set(workUrl, (async () => {
            const { text: html } = await fetchTextWithRetries(workUrl, {
                credentials: "same-origin",
                isCancelled: options.isCancelled,
                onState: options.onNetworkState,
                maxAttempts: 5,
                retryBaseMs: 1200,
                requestTimeoutMs: 45000,
                validateText: text => {
                    if (!text || text.length < 800) return false;
                    if (!/<\/body\s*>/i.test(text) && !/<\/html\s*>/i.test(text)) return false;
                    if (/cf-browser-verification|Cloudflare|Too Many Requests|<title>\s*(?:429|500|502|503|504)/i.test(text)) {
                        return false;
                    }
                    const probe = new DOMParser().parseFromString(text, "text/html");
                    return !!probe.querySelector(".fanfic-hat-body, h1.heading");
                }
            });
            const doc = new DOMParser().parseFromString(html, "text/html");
            if (!doc.querySelector(".fanfic-hat-body, h1.heading")) {
                throw new Error("Страница произведения загружена, но её структура не распознана.");
            }
            return doc;
        })());
    }

    try {
        return await workDocumentCache.get(workUrl);
    } catch (error) {
        workDocumentCache.delete(workUrl);
        throw error;
    }
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

async function loadChapters(urls, onProgress, isCancelled, options = {}) {
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
                    ...(await getChapter(urls[index], {
                        isCancelled,
                        onNetworkState: options.onNetworkState
                    })),
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

function metadataWarnings(doc, meta) {
    const warnings = [];
    const hasTitleNode = !!(
        doc.querySelector("h1.heading[itemprop='name']") ||
        doc.querySelector("h1.heading[itemprop='headline']") ||
        doc.querySelector("h1.heading") ||
        doc.querySelector("h1[itemprop='name']")
    );

    if (!hasTitleNode) warnings.push("не найдено название произведения");
    if (!meta.mainAuthor || meta.mainAuthor.missing) warnings.push("не найден автор");
    if (!meta.fandom && !meta.universe) warnings.push("не найдены фэндом и вселенная");
    if (!meta.direction) warnings.push("не найдена направленность");
    if (!meta.rating) warnings.push("не найден рейтинг");
    if (!meta.status) warnings.push("не найден статус произведения");
    if (!meta.size) warnings.push("не найден размер произведения");
    if (!meta.description) warnings.push("не найдено описание");

    for (const person of meta.unclassifiedParticipants || []) {
        warnings.push(`не удалось определить роль участника: ${person.name}`);
    }

    return warnings;
}

function createMetadataWarningError(warnings) {
    const error = new Error(
        "Некоторые данные произведения не удалось распознать. " +
        "Экспорт можно продолжить после подтверждения пользователя."
    );
    error.name = "MetadataWarningError";
    error.warnings = warnings;
    return error;
}

export async function collectBook(onProgress = () => {}, isCancelled = () => false, options = {}) {
    const onStage = typeof options.onStage === "function" ? options.onStage : () => {};
    const workUrl = options.workUrl
        ? normalizeRequestedWorkUrl(options.workUrl)
        : currentWorkUrl();

    onStage("Страница произведения…");
    const doc = await loadWorkDocument(workUrl, {
        isCancelled,
        onNetworkState: options.onNetworkState
    });
    if (isCancelled()) throw new Error("cancelled");

    onStage("Метаданные…");
    const title = getTitle(doc);
    const authors = getAuthors(doc);
    const originalAuthor = getOriginalAuthor(doc);
    const originalWork = getOriginalWork(doc);
    const translators = authors.filter(author => isRole(author, "переводчик"));
    const coTranslators = authors.filter(author => isRole(author, "сопереводчик"));
    const unclassifiedParticipants = authors.filter(author => isRole(author, "неизвестно"));
    const singleUnclassified = unclassifiedParticipants.length === 1
        ? unclassifiedParticipants[0]
        : null;
    const detectedMainAuthor =
        authors.find(author => isRole(author, "автор")) ||
        originalAuthor ||
        translators[0] ||
        coTranslators[0] ||
        singleUnclassified ||
        null;
    const mainAuthor = detectedMainAuthor || {
        name: "Неизвестный автор",
        url: "",
        role: "автор",
        missing: true
    };

    const meta = {
        title,
        authors,
        mainAuthor,
        coauthors: authors.filter(author => isRole(author, "соавтор")),
        translators,
        coTranslators,
        betas: authors.filter(author => isRole(author, "бета")),
        gammas: authors.filter(author => isRole(author, "гамма")),
        editors: authors.filter(author => isRole(author, "редактор")),
        unclassifiedParticipants,
        originalAuthor,
        originalWork,
        ...getExtraData(doc),
        ...getDirectionRatingStatus(doc),
        series: extractSeries(doc),
        sourceUrl: workUrl
    };

    options.onBookInfo?.({
        title: meta.title,
        author: meta.mainAuthor?.name || "Неизвестный автор",
        sourceUrl: workUrl
    });

    const warnings = metadataWarnings(doc, meta);
    meta.warnings = warnings;

    if (warnings.length && !options.allowIncompleteMetadata) {
        throw createMetadataWarningError(warnings);
    }

    if (isCancelled()) throw new Error("cancelled");
    const chapterUrls = extractChapterUrls(doc, workUrl);

    // Обложка и главы идут параллельно. При этом для каждого формата
    // готовим только реально нужное представление картинки. TXT вообще
    // не запускает загрузку обложки.
    const coverMode = options.coverMode || "full";
    let coverReady = coverMode === "none";
    let chaptersReady = false;
    let coverStage = "загрузка";

    const coverPromise = coverMode === "none"
        ? Promise.resolve(null)
        : getCover(doc, {
            mode: coverMode,
            onStage: stage => {
                coverStage = stage;
                if (chaptersReady && !coverReady) {
                    onStage(`Обложка: ${stage}…`);
                }
            }
        }).finally(() => {
            coverReady = true;
        });

    onStage("Подготовка списка глав…");
    const chapters = await loadChapters(chapterUrls, onProgress, isCancelled, {
        onNetworkState: options.onNetworkState
    });
    chaptersReady = true;

    if (!chapters.length) throw new Error("Не удалось загрузить главы произведения.");
    if (!coverReady) onStage(`Обложка: ${coverStage}…`);
    const cover = await coverPromise;
    if (isCancelled()) throw new Error("cancelled");

    return { meta, cover, chapters };
}
