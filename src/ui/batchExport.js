import "../utils/jszipSchedulerShim.js";
import JSZip from "jszip";
import { delay } from "../utils/delay.js";
import { downloadBlob } from "../utils/download.js";
import { sanitizeFilePart } from "../utils/generateFileName.js";
import { fetchTextWithRetries } from "../utils/network.js";

const BATCH_STYLE_ID = "ficbook-batch-export-style";
const BATCH_ROOT_ID = "ficbook-batch-export";
const MAX_LIST_PAGES = 500;
const LIST_SCAN_SMALL_DELAY_MIN_MS = 450;
const LIST_SCAN_SMALL_DELAY_MAX_MS = 900;
const LIST_SCAN_LARGE_DELAY_MIN_MS = 1600;
const LIST_SCAN_LARGE_DELAY_MAX_MS = 2800;
const LIST_PAGE_RECOVERY_ATTEMPTS = 4;
const BETWEEN_WORKS_MIN_MS = 1500;
const BETWEEN_WORKS_MAX_MS = 3000;
const WHOLE_WORK_RETRY_MIN_MS = 4500;
const WHOLE_WORK_RETRY_MAX_MS = 7000;
const BATCH_LIST_SETTINGS_KEY = "ficbook-exporter:batch-list-settings:v1";
const BATCH_LIST_FILE_NAME = "! Список произведений.txt";
const DEFAULT_BATCH_LIST_SETTINGS = Object.freeze({
    includeList: true,
    listMode: "short"
});

function isAuthorProfilePage() {
    return /^\/authors\/[^/]+\/?$/.test(location.pathname);
}

function isAuthorWorksPage() {
    return /^\/authors\/[^/]+\/profile\/works\/?$/.test(location.pathname);
}

function supportsAuthorBatchButtons() {
    // Кнопки автора нужны только на основной странице профиля и на странице
    // «Работы». Раньше проверка /authors/<id>/ была слишком широкой и
    // добавляла кнопку также в «Сборники», «Беты», «Подарки» и другие разделы.
    return isAuthorProfilePage() || isAuthorWorksPage();
}

function isCollectionPage() {
    return /^\/collections\/[^/]+(?:\/|$)/.test(location.pathname);
}

function isSeriesPage() {
    return /^\/series\/[^/]+(?:\/|$)/.test(location.pathname);
}

// Один таймер вместо старого цикла по 150 мс. Короткие повторяющиеся таймеры
// Chrome особенно сильно замедляет в фоновой вкладке, из-за чего пауза между
// произведениями могла растягиваться во много раз.
async function cancellableDelay(ms, isCancelled = () => false) {
    if (isCancelled()) throw new Error("cancelled");
    await delay(Math.max(0, ms));
    if (isCancelled()) throw new Error("cancelled");
}

function randomDelay(min, max, isCancelled = () => false) {
    return cancellableDelay(min + Math.random() * (max - min), isCancelled);
}

function cleanUrl(value) {
    try {
        const url = new URL(value, location.origin);
        url.hash = "";
        return url.href;
    } catch (_) {
        return "";
    }
}

function normalizeWorkUrl(value) {
    try {
        const url = new URL(value, location.origin);
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts[0] !== "readfic" || !parts[1]) return "";
        return new URL(`/readfic/${parts[1]}`, url.origin).href;
    } catch (_) {
        return "";
    }
}

function extractWorkUrls(doc) {
    return [...new Set(
        Array.from(doc.querySelectorAll(".fanfic-inline-title a.visit-link[href*='/readfic/']"))
            .map(link => normalizeWorkUrl(link.getAttribute("href") || link.href || ""))
            .filter(Boolean)
    )];
}

function isFilteredListInfo(info) {
    return info?.type === "author-filtered" || info?.type === "collection-filtered";
}

function isPaginationParam(key) {
    return /^(?:page|p|page_num|page_number|offset)$/i.test(String(key || ""));
}

function filteredListUrl(value) {
    try {
        const url = new URL(value, location.origin);
        url.hash = "";
        url.searchParams.delete("rnd");

        // Если пользователь оказался не на первой странице, пакет всё равно должен
        // начать с начала отфильтрованной выдачи, а затем пройти пагинацию сам.
        for (const key of [...url.searchParams.keys()]) {
            if (isPaginationParam(key)) url.searchParams.delete(key);
        }
        url.pathname = url.pathname.replace(/\/(?:page|p)\/\d+\/?$/i, "");
        return url.href;
    } catch (_) {
        return cleanUrl(value);
    }
}

function hasMeaningfulQueryFilters(value) {
    try {
        const url = new URL(value, location.origin);
        for (const [key, rawValue] of url.searchParams.entries()) {
            if (key === "rnd" || isPaginationParam(key)) continue;
            if (String(rawValue || "").trim() !== "") return true;
        }
    } catch (_) {
        // Ничего.
    }
    return false;
}

function mergeBaseQueryIntoPageUrl(url, baseUrl, info) {
    if (!isFilteredListInfo(info)) return url;

    try {
        const base = new URL(baseUrl);
        const target = new URL(url);

        // Пагинация Ficbook может не повторить часть параметров фильтра.
        // Сохраняем текущие параметры фильтра/сортировки, но не навязываем rnd
        // и не перезаписываем номер страницы, который пришёл из ссылки пагинации.
        for (const [key, value] of base.searchParams.entries()) {
            if (key === "rnd" || isPaginationParam(key)) continue;
            if (!target.searchParams.has(key)) target.searchParams.set(key, value);
        }
        return target;
    } catch (_) {
        return url;
    }
}

function paginationUrls(doc, baseUrl, info) {
    let base;
    try {
        base = new URL(baseUrl);
    } catch (_) {
        return [];
    }

    const selectors = [
        ".pagination a[href]",
        ".pager a[href]",
        ".paginator a[href]",
        ".page-pagination a[href]",
        ".pagination-holder a[href]",
        ".pagination-wrapper a[href]",
        "nav[aria-label*='страниц' i] a[href]",
        "a[rel='next'][href]",
        "a[rel='prev'][href]"
    ].join(", ");

    const urls = [];
    for (const link of doc.querySelectorAll(selectors)) {
        try {
            let url = new URL(link.getAttribute("href") || link.href || "", base);
            url = mergeBaseQueryIntoPageUrl(url, base, info);
            url.hash = "";
            if (url.origin !== base.origin) continue;

            const basePath = base.pathname.replace(/\/$/, "");
            const targetPath = url.pathname.replace(/\/$/, "");
            const samePath = targetPath === basePath;
            const childPagePath = targetPath.startsWith(`${basePath}/`);
            if (!samePath && !childPagePath) continue;

            urls.push(url.href);
        } catch (_) {
            // Игнорируем повреждённые ссылки пагинации.
        }
    }

    return [...new Set(urls)];
}

function looksLikeCompleteHtml(html) {
    if (!html || html.length < 500) return false;
    if (/cf-browser-verification|Cloudflare|Too Many Requests|<title>\s*(?:429|500|502|503|504)/i.test(html)) {
        return false;
    }
    return /<\/body\s*>/i.test(html) || /<\/html\s*>/i.test(html);
}

async function fetchDocument(url, { isCancelled = () => false, onNetworkState = () => {} } = {}) {
    const current = new URL(location.href);
    const target = new URL(url);
    const sameDocument =
        current.origin === target.origin &&
        current.pathname.replace(/\/$/, "") === target.pathname.replace(/\/$/, "") &&
        current.search === target.search;

    if (sameDocument) return document;

    const { text: html } = await fetchTextWithRetries(target.href, {
        credentials: "same-origin",
        isCancelled,
        onState: onNetworkState,
        maxAttempts: 5,
        retryBaseMs: 1200,
        requestTimeoutMs: 45000,
        validateText: text => looksLikeCompleteHtml(text)
    });

    return new DOMParser().parseFromString(html, "text/html");
}

function authorProfileName() {
    return (
        document.querySelector(".profile-header-body .text-t1.text-bold")?.textContent?.trim() ||
        document.querySelector("meta[property='og:title']")?.getAttribute("content")?.split("–")[0]?.trim() ||
        "Автор"
    );
}

function authorInfo() {
    const worksLink = document.querySelector(".sidebar-nav a[href*='/profile/works']");
    const counter = worksLink?.querySelector(".counter")?.textContent || worksLink?.textContent || "";
    const expectedCount = Number.parseInt(counter.replace(/\D/g, ""), 10) || 0;
    const profileName = authorProfileName();

    let listUrl = worksLink?.getAttribute("href") || worksLink?.href || "";
    if (!listUrl) {
        const match = location.pathname.match(/^\/authors\/([^/]+)/);
        if (match) listUrl = `/authors/${match[1]}/profile/works`;
    }

    return {
        type: "author",
        expectedCount,
        listUrl: cleanUrl(listUrl),
        label: profileName,
        buttonText: "Скачать все работы",
        archiveBase: `${profileName} - все работы`
    };
}

function filteredAuthorInfo() {
    if (!isAuthorWorksPage()) return null;

    const profileName = authorProfileName();

    return {
        type: "author-filtered",
        expectedCount: 0,
        listUrl: filteredListUrl(location.href),
        label: profileName,
        buttonText: "Скачать по фильтрам",
        archiveBase: `${profileName} - по фильтрам`
    };
}

function collectionCountFromDoc(doc) {
    const heading = doc?.querySelector?.(".collections-page-heading");
    const headingText = heading?.textContent?.replace(/\s+/g, " ")?.trim() || "";
    const countMatch = headingText.match(/\((\d+)\)\s*$/);
    return countMatch ? Number.parseInt(countMatch[1], 10) : 0;
}

function collectionInfo() {
    const heading = document.querySelector(".collections-page-heading");
    const headingText = heading?.textContent?.replace(/\s+/g, " ")?.trim() || "Сборник";
    const label = headingText.replace(/\s*\(\d+\)\s*$/, "").trim() || "Сборник";
    const url = new URL(location.href);
    url.search = "";
    url.hash = "";

    // На странице с активными фильтрами число возле заголовка может относиться
    // только к отфильтрованной выдаче. Для кнопки «Скачать сборник» мы идём на
    // чистый URL без query-параметров, поэтому точное общее число возьмём уже
    // из загруженной нефильтрованной страницы в collectAllWorkUrls().
    const expectedCount = hasMeaningfulQueryFilters(location.href)
        ? 0
        : collectionCountFromDoc(document);

    return {
        type: "collection",
        expectedCount,
        listUrl: url.href,
        label,
        buttonText: "Скачать сборник",
        archiveBase: label
    };
}

function filteredCollectionInfo() {
    if (!isCollectionPage()) return null;

    const allInfo = collectionInfo();
    return {
        type: "collection-filtered",
        // Число возле заголовка относится ко всему сборнику, а не к результату
        // фильтрации, поэтому сравнивать с ним отфильтрованную выдачу нельзя.
        expectedCount: 0,
        listUrl: filteredListUrl(location.href),
        label: allInfo.label,
        buttonText: "Скачать по фильтрам",
        archiveBase: `${allInfo.label} - по фильтрам`
    };
}

function seriesInfo() {
    const heading = document.querySelector("h1.heading.word-break, h1.heading");
    const headingText = heading?.textContent?.replace(/\s+/g, " ")?.trim() || "Серия";
    const label = headingText
        .replace(/^Серия\s+[«\"]?/i, "")
        .replace(/[»\"]\s*$/, "")
        .trim() || "Серия";

    const countNode = Array.from(document.querySelectorAll("div, p, span"))
        .find(node => /^В серии\s+\d+\s+работ/i.test((node.textContent || "").replace(/\s+/g, " ").trim()));
    const countMatch = (countNode?.textContent || "").match(/В серии\s+(\d+)\s+работ/i);
    const expectedCount = countMatch ? Number.parseInt(countMatch[1], 10) : 0;

    const url = new URL(location.href);
    url.search = "";
    url.hash = "";

    return {
        type: "series",
        expectedCount,
        listUrl: url.href,
        label,
        buttonText: "Скачать серию",
        archiveBase: `Серия ${label}`
    };
}

function pageInfos() {
    if (supportsAuthorBatchButtons()) {
        return [authorInfo(), filteredAuthorInfo()].filter(Boolean);
    }
    if (isCollectionPage()) {
        return [collectionInfo(), filteredCollectionInfo()].filter(Boolean);
    }
    if (isSeriesPage()) return [seriesInfo()];
    return [];
}

function typeLabel(info) {
    if (info.type === "author") return "Все работы автора";
    if (info.type === "author-filtered") return "Работы автора по текущим фильтрам";
    if (info.type === "collection") return "Сборник";
    if (info.type === "collection-filtered") return "Сборник по текущим фильтрам";
    if (info.type === "series") return "Серия";
    return "Пакет";
}

function isRetryableListScanError(error) {
    const status = Number(error?.status || 0);
    return (
        error?.retryable === true ||
        !status ||
        status === 403 ||
        status === 408 ||
        status === 425 ||
        status === 429 ||
        status >= 500
    );
}

function listRecoveryDelayMs(error, recoveryAttempt) {
    const status = Number(error?.status || 0);
    const jitter = Math.random() * 4000;

    // 429/403 обычно означают временное ограничение/защиту от слишком частых
    // запросов. Короткие повторы только усугубляют ситуацию, поэтому даём
    // Ficbook заметную паузу и увеличиваем её при повторных срабатываниях.
    if (status === 429 || status === 403) {
        return Math.min(90000, 20000 * recoveryAttempt + jitter);
    }

    // Для таймаутов и 5xx пауза короче, но тоже растущая.
    return Math.min(45000, 7000 * recoveryAttempt + jitter);
}

function listScanDelayMs(info, visitedCount, foundCount) {
    const largeList =
        Number(info?.expectedCount || 0) >= 200 ||
        foundCount >= 150 ||
        visitedCount >= 8;

    const min = largeList ? LIST_SCAN_LARGE_DELAY_MIN_MS : LIST_SCAN_SMALL_DELAY_MIN_MS;
    const max = largeList ? LIST_SCAN_LARGE_DELAY_MAX_MS : LIST_SCAN_SMALL_DELAY_MAX_MS;
    return min + Math.random() * (max - min);
}

async function fetchListPageWithRecovery(
    pageUrl,
    pageNumber,
    foundCount,
    requireWorks,
    onStatus,
    isCancelled
) {
    let recoveryAttempt = 0;

    for (;;) {
        if (isCancelled()) throw new Error("cancelled");

        try {
            const doc = await fetchDocument(pageUrl, {
                isCancelled,
                onNetworkState: state => {
                    if (!state) return;
                    onStatus(
                        `Проверка списка: страница ${pageNumber}, найдено ${foundCount}. ${state}`
                    );
                }
            });
            const pageWorks = extractWorkUrls(doc);

            // Иногда защитная/ошибочная страница Ficbook приходит с HTTP 200.
            // Если до этого уже были работы (или счётчик обещает работы), пустой
            // результат считаем временной ошибкой и повторяем именно эту страницу.
            if (requireWorks && pageWorks.length === 0) {
                const error = new Error("Ficbook вернул страницу списка без произведений.");
                error.retryable = true;
                throw error;
            }

            return { doc, pageWorks };
        } catch (error) {
            if (error?.message === "cancelled" || isCancelled()) throw new Error("cancelled");
            if (!isRetryableListScanError(error) || recoveryAttempt >= LIST_PAGE_RECOVERY_ATTEMPTS) {
                throw error;
            }

            recoveryAttempt += 1;
            const waitMs = listRecoveryDelayMs(error, recoveryAttempt);
            const seconds = Math.max(1, Math.round(waitMs / 1000));
            const status = Number(error?.status || 0);
            const reason = status === 429
                ? "Ficbook временно ограничил частоту запросов"
                : status === 403
                    ? "Ficbook временно отклонил запрос"
                    : error?.retryable === true && /без произведений/i.test(error?.message || "")
                        ? "Ficbook вернул неполную страницу"
                        : "сервер временно не ответил";

            onStatus(
                `Проверка списка: страница ${pageNumber}, найдено ${foundCount}. ` +
                `${reason}; пауза ${seconds} с и повтор без потери прогресса…`
            );
            await cancellableDelay(waitMs, isCancelled);
        }
    }
}

async function collectAllWorkUrls(info, onStatus, isCancelled) {
    if (!info?.listUrl) throw new Error("Не удалось определить страницу со списком работ.");

    const queue = [info.listUrl];
    const visited = new Set();
    const works = new Set();

    while (queue.length) {
        if (isCancelled()) throw new Error("cancelled");
        if (visited.size >= MAX_LIST_PAGES) {
            throw new Error(`Слишком много страниц списка (>${MAX_LIST_PAGES}). Экспорт остановлен для безопасности.`);
        }

        const pageUrl = queue.shift();
        if (!pageUrl || visited.has(pageUrl)) continue;

        const pageNumber = visited.size + 1;
        onStatus(`Проверка списка: страница ${pageNumber}, найдено ${works.size}`);

        // Важно: помечаем страницу посещённой только после успешной загрузки.
        // Раньше при сетевой ошибке она уже попадала в visited, а весь проход
        // завершался. Для больших сборников это особенно легко ловилось в середине.
        const { doc, pageWorks } = await fetchListPageWithRecovery(
            pageUrl,
            pageNumber,
            works.size,
            works.size > 0 || Number(info.expectedCount || 0) > 0,
            onStatus,
            isCancelled
        );

        visited.add(pageUrl);

        // Если «Скачать сборник» запущено со страницы, где были активны фильтры,
        // исходное число возле заголовка нельзя использовать: оно может быть числом
        // результатов фильтра. После загрузки чистой страницы сборника восстанавливаем
        // настоящее общее количество и снова используем строгую проверку полноты.
        if (info.type === "collection" && info.expectedCount <= 0) {
            const total = collectionCountFromDoc(doc);
            if (total > 0) info.expectedCount = total;
        }

        pageWorks.forEach(url => works.add(url));
        onStatus(`Проверка списка: страница ${visited.size}, найдено ${works.size}`);

        // Для профиля автора число в боковом счётчике бывает справочным и
        // может не совпадать с реально доступным списком. Поэтому список автора
        // всегда обходим до конца пагинации, даже если счётчик уже достигнут.
        if (info.type !== "author" && info.expectedCount > 0 && works.size === info.expectedCount) break;

        for (const nextUrl of paginationUrls(doc, info.listUrl, info)) {
            if (!visited.has(nextUrl) && !queue.includes(nextUrl)) queue.push(nextUrl);
        }

        // На коротких списках задержка почти незаметна. На больших автоматически
        // замедляем обход, чтобы не посылать десятки страниц подряд и не ловить 429.
        if (queue.length) {
            await cancellableDelay(
                listScanDelayMs(info, visited.size, works.size),
                isCancelled
            );
        }
    }

    return [...works];
}

function installStyles() {
    if (document.getElementById(BATCH_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = BATCH_STYLE_ID;
    style.textContent = `
#${BATCH_ROOT_ID} { font-family: inherit; }
.fbe-batch-sidebar { margin-top: 10px; display: grid; gap: 7px; }
.fbe-batch-sidebar .fbe-batch-control,
.fbe-batch-sidebar .fbe-batch-trigger { width: 100%; }
.fbe-batch-collection { margin: 10px 0 14px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; }
.fbe-batch-series { margin: 8px 0 12px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; }
.fbe-batch-heading { display: inline-flex; flex: 0 0 auto; }
.fbe-batch-control { position: relative; display: inline-flex; }
.fbe-batch-trigger {
    min-height: 34px;
    gap: 6px;
    background: #4f86c6 !important;
    border: 1px solid #2f639d !important;
    color: #fff !important;
    font-weight: 700;
}
.fbe-batch-trigger:hover,
.fbe-batch-trigger:focus-visible,
.fbe-batch-trigger[aria-expanded="true"] {
    background: #356da9 !important;
    border-color: #244f7c !important;
    color: #fff !important;
}
.fbe-batch-trigger-chevron { font-size: 9px; transition: transform .15s ease; }
.fbe-batch-trigger[aria-expanded="true"] .fbe-batch-trigger-chevron { transform: rotate(180deg); }
.fbe-batch-menu {
    position: absolute;
    top: calc(100% + 5px);
    right: 0;
    z-index: 10030;
    display: none;
    min-width: 220px;
    padding: 5px;
    border: 1px solid rgba(64,48,35,.18);
    border-radius: 8px;
    background: #fffaf3;
    box-shadow: 0 8px 22px rgba(45,31,22,.2);
}
.fbe-batch-sidebar .fbe-batch-menu,
.fbe-batch-collection .fbe-batch-menu,
.fbe-batch-series .fbe-batch-menu { left: 0; right: auto; }
.fbe-batch-sidebar .fbe-batch-menu { width: 100%; }
.fbe-batch-menu.is-open { display: grid; gap: 3px; }
.fbe-batch-menu button {
    min-height: 34px;
    padding: 7px 10px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #3f2d21;
    cursor: pointer;
    font: inherit;
    text-align: left;
}
.fbe-batch-menu button:hover,
.fbe-batch-menu button:focus-visible { background: rgba(122,87,52,.12); outline: none; }
body.dark-theme .fbe-batch-menu { background: #2d2723; border-color: rgba(255,255,255,.14); }
body.dark-theme .fbe-batch-menu button { color: #f4ece5; }
body.dark-theme .fbe-batch-menu button:hover,
body.dark-theme .fbe-batch-menu button:focus-visible { background: rgba(255,255,255,.09); }

.fbe-batch-overlay {
    position: fixed;
    inset: 0;
    z-index: 100100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0,0,0,.58);
}
.fbe-batch-dialog {
    width: min(650px, 100%);
    max-height: min(780px, calc(100vh - 40px));
    overflow: auto;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(75,55,40,.22);
    background: #fffaf7;
    box-shadow: 0 18px 55px rgba(0,0,0,.35);
    color: #332822;
}
.fbe-batch-title { margin: 0 0 12px; font-size: 21px; line-height: 1.25; }
.fbe-batch-summary { margin: 0 0 14px; line-height: 1.45; }
.fbe-batch-do-not-close {
    margin: 10px 0 14px;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(198,40,40,.09);
    color: #9f1f1f;
    font-weight: 700;
    line-height: 1.4;
}
.fbe-batch-status { margin: 12px 0 8px; font-weight: 700; word-break: break-word; }
.fbe-batch-book-info { display: grid; gap: 5px; margin: 0 0 10px; }
.fbe-batch-info-line { color: #4f4037; word-break: break-word; }
.fbe-batch-info-line strong { color: inherit; }
.fbe-batch-stage { min-height: 22px; margin: 0 0 6px; color: #6c5a4d; word-break: break-word; }
.fbe-batch-network { min-height: 0; margin: 0 0 10px; color: #a05b00; font-weight: 700; word-break: break-word; }
.fbe-batch-url { margin: 0 0 10px; color: #8a7768; font-size: 12px; word-break: break-all; }
.fbe-batch-progress { height: 9px; overflow: hidden; border-radius: 999px; background: rgba(80,60,45,.14); }
.fbe-batch-progress > div { width: 0; height: 100%; background: #4f86c6; transition: width .18s ease; }
.fbe-batch-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; margin-top: 18px; }
.fbe-batch-action {
    min-height: 38px;
    padding: 8px 14px;
    border-radius: 7px;
    border: 1px solid rgba(60,45,36,.25);
    background: #fff;
    color: #332822;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
}
.fbe-batch-action-primary { background: #4f86c6; border-color: #2f639d; color: #fff; }
.fbe-batch-action-danger { background: #c62828; border-color: #a91f1f; color: #fff; }
.fbe-batch-list-options {
    margin: 12px 0 14px;
    padding: 12px 14px;
    border: 1px solid rgba(64,48,35,.16);
    border-radius: 8px;
    background: rgba(79,134,198,.06);
}
.fbe-batch-list-option { display: flex; align-items: flex-start; gap: 8px; line-height: 1.4; cursor: pointer; }
.fbe-batch-list-option + .fbe-batch-list-option { margin-top: 7px; }
.fbe-batch-list-option input { margin-top: 3px; flex: 0 0 auto; }
.fbe-batch-list-modes { margin: 9px 0 0 24px; }
.fbe-batch-list-modes.is-disabled { opacity: .55; }
.fbe-batch-list-hint { margin: 8px 0 0 24px; color: #6c5a4d; font-size: 12px; line-height: 1.4; }
.fbe-batch-error-list { margin: 10px 0 0 20px; padding: 0; color: #b71c1c; }
.fbe-batch-warning-title { color: #c62828; }
body.dark-theme .fbe-batch-dialog { background: #2d2723; color: #f4ece5; border-color: rgba(255,255,255,.14); }
body.dark-theme .fbe-batch-info-line,
body.dark-theme .fbe-batch-stage,
body.dark-theme .fbe-batch-url { color: #cdbfb4; }
body.dark-theme .fbe-batch-network { color: #ffc36a; }
body.dark-theme .fbe-batch-do-not-close { background: rgba(255,100,100,.12); color: #ff9a9a; }
body.dark-theme .fbe-batch-action { background: #3a322d; color: #f4ece5; border-color: rgba(255,255,255,.2); }
body.dark-theme .fbe-batch-action-primary { background: #356da9; color: #fff; }
body.dark-theme .fbe-batch-action-danger { background: #b72a2a; color: #fff; }
body.dark-theme .fbe-batch-list-options { background: rgba(79,134,198,.10); border-color: rgba(255,255,255,.14); }
body.dark-theme .fbe-batch-list-hint { color: #cdbfb4; }
`;
    document.head.appendChild(style);
}

function makeOverlay(titleText) {
    const overlay = document.createElement("div");
    overlay.className = "fbe-batch-overlay";

    const dialog = document.createElement("div");
    dialog.className = "fbe-batch-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");

    const title = document.createElement("h2");
    title.className = "fbe-batch-title";
    title.textContent = titleText;

    dialog.appendChild(title);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    return { overlay, dialog, title };
}

function actionButton(text, className = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `fbe-batch-action ${className}`.trim();
    button.textContent = text;
    return button;
}

function loadBatchListSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(BATCH_LIST_SETTINGS_KEY) || "null");
        return {
            includeList: typeof saved?.includeList === "boolean"
                ? saved.includeList
                : DEFAULT_BATCH_LIST_SETTINGS.includeList,
            listMode: saved?.listMode === "extended" ? "extended" : "short"
        };
    } catch (_) {
        return { ...DEFAULT_BATCH_LIST_SETTINGS };
    }
}

function saveBatchListSettings(settings) {
    try {
        localStorage.setItem(BATCH_LIST_SETTINGS_KEY, JSON.stringify({
            includeList: !!settings?.includeList,
            listMode: settings?.listMode === "extended" ? "extended" : "short"
        }));
    } catch (_) {
        // Если хранилище браузера недоступно, настройки просто не запоминаются.
    }
}

function confirmBatchStart(info, format, count) {
    return new Promise(resolve => {
        const { overlay, dialog } = makeOverlay(`${typeLabel(info)} → ${format}`);
        const savedSettings = loadBatchListSettings();

        const text = document.createElement("p");
        text.className = "fbe-batch-summary";
        text.textContent =
            `Найдено работ: ${count}. Формат: ${format}. ` +
            "Каждое произведение будет отдельным файлом, а после проверки полноты все файлы будут упакованы в один ZIP.";

        const listOptions = document.createElement("div");
        listOptions.className = "fbe-batch-list-options";

        const includeLabel = document.createElement("label");
        includeLabel.className = "fbe-batch-list-option";
        const includeList = document.createElement("input");
        includeList.type = "checkbox";
        includeList.checked = savedSettings.includeList;
        const includeText = document.createElement("span");
        includeText.textContent = `Добавить «${BATCH_LIST_FILE_NAME}» в архив`;
        includeLabel.append(includeList, includeText);

        const modes = document.createElement("div");
        modes.className = "fbe-batch-list-modes";

        const shortLabel = document.createElement("label");
        shortLabel.className = "fbe-batch-list-option";
        const shortMode = document.createElement("input");
        shortMode.type = "radio";
        shortMode.name = "fbe-batch-list-mode";
        shortMode.value = "short";
        shortMode.checked = savedSettings.listMode !== "extended";
        const shortText = document.createElement("span");
        shortText.textContent = "Краткий список — автор и название";
        shortLabel.append(shortMode, shortText);

        const extendedLabel = document.createElement("label");
        extendedLabel.className = "fbe-batch-list-option";
        const extendedMode = document.createElement("input");
        extendedMode.type = "radio";
        extendedMode.name = "fbe-batch-list-mode";
        extendedMode.value = "extended";
        extendedMode.checked = savedSettings.listMode === "extended";
        const extendedText = document.createElement("span");
        extendedText.textContent = "Расширенный список — основная информация из шапки каждого произведения";
        extendedLabel.append(extendedMode, extendedText);
        modes.append(shortLabel, extendedLabel);

        const hint = document.createElement("div");
        hint.className = "fbe-batch-list-hint";
        hint.textContent = "Список сортируется по реальным именам файлов в ZIP, чтобы его было легко сопоставить с книгами.";

        const syncModes = () => {
            shortMode.disabled = !includeList.checked;
            extendedMode.disabled = !includeList.checked;
            modes.classList.toggle("is-disabled", !includeList.checked);
        };

        const persist = () => {
            saveBatchListSettings({
                includeList: includeList.checked,
                listMode: extendedMode.checked ? "extended" : "short"
            });
        };

        includeList.addEventListener("change", () => {
            syncModes();
            persist();
        });
        shortMode.addEventListener("change", persist);
        extendedMode.addEventListener("change", persist);
        syncModes();

        listOptions.append(includeLabel, modes, hint);

        const note = document.createElement("p");
        note.className = "fbe-batch-summary";
        note.textContent =
            "Работы загружаются последовательно. Защитные задержки между главами сохраняются; " +
            "между произведениями добавляется отдельная пауза.";

        const warning = document.createElement("div");
        warning.className = "fbe-batch-do-not-close";
        warning.textContent =
            "Не закрывайте и не перезагружайте страницу до окончания скачивания. " +
            "В фоне загрузка может замедлиться или приостановиться.";

        const actions = document.createElement("div");
        actions.className = "fbe-batch-actions";
        const cancel = actionButton("Отмена");
        const start = actionButton("Начать", "fbe-batch-action-primary");
        actions.append(cancel, start);
        dialog.append(text, listOptions, note, warning, actions);

        const finish = value => {
            overlay.remove();
            resolve(value);
        };
        cancel.addEventListener("click", () => finish(null), { once: true });
        start.addEventListener("click", () => {
            const settings = {
                includeList: includeList.checked,
                listMode: extendedMode.checked ? "extended" : "short"
            };
            saveBatchListSettings(settings);
            finish(settings);
        }, { once: true });
        start.focus();
    });
}

function confirmIncompleteMetadata(url, warnings, format) {
    return new Promise(resolve => {
        const { overlay, dialog, title } = makeOverlay("ВНИМАНИЕ: часть данных не найдена");
        title.classList.add("fbe-batch-warning-title");

        const text = document.createElement("p");
        text.className = "fbe-batch-summary";
        text.textContent = `Проблема при пакетном экспорте ${format}: ${url}`;

        const list = document.createElement("ul");
        list.className = "fbe-batch-error-list";
        (warnings?.length ? warnings : ["неизвестная ошибка метаданных"]).forEach(message => {
            const item = document.createElement("li");
            item.textContent = message;
            list.appendChild(item);
        });

        const note = document.createElement("p");
        note.className = "fbe-batch-summary";
        note.textContent = "Можно продолжить эту работу с неполными метаданными или отменить весь пакет.";

        const actions = document.createElement("div");
        actions.className = "fbe-batch-actions";
        const cancel = actionButton("Отменить весь пакет");
        const accept = actionButton("Скачать всё равно", "fbe-batch-action-danger");
        actions.append(cancel, accept);
        dialog.append(text, list, note, actions);

        const finish = value => {
            overlay.remove();
            resolve(value);
        };
        cancel.addEventListener("click", () => finish(false), { once: true });
        accept.addEventListener("click", () => finish(true), { once: true });
        accept.focus();
    });
}

function infoLine(label) {
    const row = document.createElement("div");
    row.className = "fbe-batch-info-line";
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    const value = document.createElement("span");
    value.textContent = "—";
    row.append(strong, value);
    return { row, value };
}

function createProgressDialog(info, format, total) {
    const { overlay, dialog } = makeOverlay(`${typeLabel(info)} → ${format}`);

    const summary = document.createElement("p");
    summary.className = "fbe-batch-summary";
    summary.textContent = `Всего произведений: ${total}. Неполный архив создан не будет.`;

    const warning = document.createElement("div");
    warning.className = "fbe-batch-do-not-close";
    warning.textContent = "Не закрывайте и не перезагружайте страницу до окончания скачивания. В фоне загрузка может замедлиться или приостановиться.";

    const status = document.createElement("div");
    status.className = "fbe-batch-status";
    status.textContent = "Подготовка…";

    const bookInfo = document.createElement("div");
    bookInfo.className = "fbe-batch-book-info";
    const titleLine = infoLine("Название");
    const authorLine = infoLine("Автор");
    const chapterLine = infoLine("Глава");
    bookInfo.append(titleLine.row, authorLine.row, chapterLine.row);

    const stage = document.createElement("div");
    stage.className = "fbe-batch-stage";
    stage.textContent = "Этап: подготовка…";

    const network = document.createElement("div");
    network.className = "fbe-batch-network";

    const urlLine = document.createElement("div");
    urlLine.className = "fbe-batch-url";

    const progress = document.createElement("div");
    progress.className = "fbe-batch-progress";
    const bar = document.createElement("div");
    progress.appendChild(bar);

    const actions = document.createElement("div");
    actions.className = "fbe-batch-actions";
    const cancel = actionButton("Остановить");
    actions.appendChild(cancel);

    dialog.append(summary, warning, status, bookInfo, stage, network, urlLine, progress, actions);

    let cancelled = false;
    cancel.addEventListener("click", () => {
        cancelled = true;
        cancel.disabled = true;
        cancel.textContent = "Остановка…";
        status.textContent = "Останавливаем после текущего запроса…";
    });

    return {
        isCancelled: () => cancelled,
        setWork(index, url) {
            status.textContent = `Произведение ${index}/${total}`;
            titleLine.value.textContent = "Получаем данные…";
            authorLine.value.textContent = "Получаем данные…";
            chapterLine.value.textContent = "—";
            stage.textContent = "Этап: страница произведения…";
            network.textContent = "";
            urlLine.textContent = url;
            bar.style.width = `${Math.max(0, Math.min(100, ((index - 1) / total) * 100))}%`;
        },
        setBookInfo(book) {
            titleLine.value.textContent = book?.title || "Неизвестно";
            authorLine.value.textContent = book?.author || "Неизвестно";
        },
        setChapter(current, chaptersTotal) {
            chapterLine.value.textContent = `${current}/${chaptersTotal}`;
        },
        setStage(text) {
            stage.textContent = text ? `Этап: ${text}` : "";
        },
        setDetail(text) {
            this.setStage(text);
        },
        setNetworkState(text) {
            network.textContent = text || "";
        },
        setFinished() {
            bar.style.width = "100%";
            status.textContent = `Проверено ${total}/${total}`;
            chapterLine.value.textContent = "—";
            network.textContent = "";
        },
        close() {
            overlay.remove();
        }
    };
}

function confirmAuthorCountMismatch(info, foundCount) {
    return new Promise(resolve => {
        const { overlay, dialog, title } = makeOverlay("Счётчик Ficbook не совпал");
        title.classList.add("fbe-batch-warning-title");

        const text = document.createElement("p");
        text.className = "fbe-batch-summary";
        text.textContent =
            `В профиле Ficbook указано ${info.expectedCount} работ, а в доступном списке найдено ${foundCount}. ` +
            "Такое бывает, если одна из работ скрыта или недоступна посетителю либо счётчик профиля обновился не сразу.";

        const note = document.createElement("p");
        note.className = "fbe-batch-summary";
        note.textContent =
            `Экспортёр прошёл все доступные страницы списка. Можно продолжить и скачать ${foundCount} найденных работ. ` +
            "Работа, которой нет в списке Ficbook, в архив попасть не сможет.";

        const actions = document.createElement("div");
        actions.className = "fbe-batch-actions";
        const cancel = actionButton("Отмена");
        const proceed = actionButton(`Скачать ${foundCount} работ`, "fbe-batch-action-primary");
        actions.append(cancel, proceed);
        dialog.append(text, note, actions);

        const finish = value => {
            overlay.remove();
            resolve(value);
        };
        cancel.addEventListener("click", () => finish(false), { once: true });
        proceed.addEventListener("click", () => finish(true), { once: true });
        proceed.focus();
    });
}

function showFatalResult(title, message, failed = []) {
    return new Promise(resolve => {
        const { overlay, dialog, title: titleElement } = makeOverlay(title);
        titleElement.classList.add("fbe-batch-warning-title");

        const text = document.createElement("p");
        text.className = "fbe-batch-summary";
        text.textContent = message;
        dialog.appendChild(text);

        if (failed.length) {
            const list = document.createElement("ul");
            list.className = "fbe-batch-error-list";
            failed.forEach(item => {
                const li = document.createElement("li");
                li.textContent = `${item.url} — ${item.error?.message || item.error || "ошибка"}`;
                list.appendChild(li);
            });
            dialog.appendChild(list);
        }

        const actions = document.createElement("div");
        actions.className = "fbe-batch-actions";
        const close = actionButton("Закрыть", "fbe-batch-action-primary");
        actions.appendChild(close);
        dialog.appendChild(actions);
        close.addEventListener("click", () => {
            overlay.remove();
            resolve();
        }, { once: true });
        close.focus();
    });
}

function uniqueArchiveName(name, usedNames) {
    const raw = String(name || "file").trim() || "file";
    const dot = raw.lastIndexOf(".");
    const base = dot > 0 ? raw.slice(0, dot) : raw;
    const ext = dot > 0 ? raw.slice(dot) : "";
    let candidate = raw;
    let index = 2;

    while (usedNames.has(candidate.toLowerCase())) {
        candidate = `${base} (${index++})${ext}`;
    }
    usedNames.add(candidate.toLowerCase());
    return candidate;
}

function localDateStamp(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

async function validateArtifact(artifact, format) {
    if (!artifact?.fileName || !(artifact.blob instanceof Blob) || artifact.blob.size <= 0) {
        return false;
    }

    const expectedExt = `.${format.toLowerCase()}`;
    if (!artifact.fileName.toLowerCase().endsWith(expectedExt)) return false;

    if (format === "PDF") {
        const prefix = await artifact.blob.slice(0, 8).text();
        return prefix.startsWith("%PDF-");
    }

    if (format === "EPUB") {
        const bytes = new Uint8Array(await artifact.blob.slice(0, 4).arrayBuffer());
        return bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
    }

    if (format === "FB2") {
        const head = await artifact.blob.slice(0, 4096).text();
        const tail = await artifact.blob.slice(Math.max(0, artifact.blob.size - 4096)).text();
        return /<FictionBook\b/.test(head) && /<\/FictionBook>/.test(tail);
    }

    if (format === "TXT") {
        const head = await artifact.blob.slice(0, 512).text();
        return head.replace(/^\ufeff/, "").trim().length > 0;
    }

    return true;
}

function batchListContextLine(info) {
    const label = String(info?.label || "").trim() || "Без названия";
    if (info?.type === "author") return `Все работы автора: ${label}`;
    if (info?.type === "author-filtered") return `Работы автора по фильтрам: ${label}`;
    if (info?.type === "collection") return `Сборник: ${label}`;
    if (info?.type === "collection-filtered") return `Сборник по фильтрам: ${label}`;
    if (info?.type === "series") return `Серия: ${label}`;
    return `${typeLabel(info)}: ${label}`;
}

function normalizeListText(value, { multiline = false } = {}) {
    const text = String(value ?? "")
        .replace(/\r\n?/g, "\n")
        .replace(/[\t\f\v]+/g, " ")
        .trim();

    if (!text) return "";
    if (!multiline) return text.replace(/\s+/g, " ");

    return text
        .split("\n")
        .map(line => line.replace(/[ \u00a0]+/g, " ").trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function participantNames(values) {
    if (!Array.isArray(values)) return "";
    return [...new Set(values
        .map(value => normalizeListText(value?.name ?? value))
        .filter(Boolean))]
        .join(", ");
}

function bookListData(entry) {
    const bookInfo = entry?.artifact?.batchBookInfo || {};
    const meta = bookInfo?.meta || {};
    return {
        bookInfo,
        meta,
        title: normalizeListText(meta.title || bookInfo.title) || "Без названия",
        author: normalizeListText(meta.mainAuthor?.name || bookInfo.author) || "Неизвестный автор"
    };
}

function appendDetail(lines, label, value, { multiline = false } = {}) {
    const text = normalizeListText(value, { multiline });
    if (!text) return;

    if (multiline && text.includes("\n")) {
        lines.push(`${label}:`, text);
    } else {
        lines.push(`${label}: ${text}`);
    }
}

function createWorksListText(info, format, entries, mode) {
    const lines = [
        batchListContextLine(info),
        `Произведений: ${entries.length}`,
        `Формат: ${format}`,
        ""
    ];

    if (mode !== "extended") {
        entries.forEach((entry, index) => {
            const { title, author } = bookListData(entry);
            lines.push(`${index + 1}. ${author} — ${title}`);
        });
        return `\ufeff${lines.join("\r\n")}\r\n`;
    }

    const divider = "=".repeat(78);

    entries.forEach((entry, index) => {
        const { bookInfo, meta, title, author } = bookListData(entry);
        lines.push(divider, `${index + 1}. ${author} — ${title}`, divider);
        appendDetail(lines, "Файл", entry.archiveName);
        appendDetail(lines, "Название", title);
        appendDetail(lines, "Автор", author);
        appendDetail(lines, "Соавторы", participantNames(meta.coauthors));
        appendDetail(lines, "Переводчики", participantNames(meta.translators));
        appendDetail(lines, "Сопереводчики", participantNames(meta.coTranslators));
        appendDetail(lines, "Беты", participantNames(meta.betas));
        appendDetail(lines, "Гаммы", participantNames(meta.gammas));
        appendDetail(lines, "Редакторы", participantNames(meta.editors));
        appendDetail(lines, "Участники (роль не определена)", participantNames(meta.unclassifiedParticipants));
        appendDetail(lines, "Автор оригинала", meta.originalAuthor?.name);
        appendDetail(lines, "Оригинал", meta.originalWork?.url);
        appendDetail(lines, "Серия", meta.series?.name);
        appendDetail(lines, "Вселенная", meta.universe);
        appendDetail(lines, "Фэндом", meta.fandom);
        appendDetail(lines, "Пэйринг и персонажи", Array.isArray(meta.pairings) ? meta.pairings.join(", ") : meta.pairings);
        appendDetail(lines, "Направленность", meta.direction);
        appendDetail(lines, "Рейтинг", meta.rating);
        appendDetail(lines, "Статус", meta.status);
        appendDetail(lines, "Размер", meta.size ? `${normalizeListText(meta.size)} слов` : "");

        if (Array.isArray(meta.tagSections) && meta.tagSections.length) {
            for (const section of meta.tagSections) {
                appendDetail(lines, section?.label || "Метки", Array.isArray(section?.tags) ? section.tags.join(", ") : "");
            }
        } else {
            appendDetail(lines, "Метки", meta.tags);
        }

        appendDetail(lines, "Описание", meta.description, { multiline: true });
        appendDetail(lines, "Примечания автора", meta.notes, { multiline: true });
        appendDetail(lines, "Публикация на других ресурсах", meta.otherPublication, { multiline: true });
        appendDetail(lines, "Источник", meta.sourceUrl || bookInfo.sourceUrl || entry.url);
        lines.push("");
    });

    return `\ufeff${lines.join("\r\n")}\r\n`;
}

async function createArchive(info, format, workUrls, artifacts, progress, batchOptions = DEFAULT_BATCH_LIST_SETTINGS) {
    if (progress.isCancelled()) throw new Error("cancelled");

    progress.setStage(`Финальная проверка: ${artifacts.length}/${workUrls.length} файлов…`);

    if (artifacts.length !== workUrls.length) {
        throw new Error(`Контроль количества не пройден: ожидалось ${workUrls.length}, готово ${artifacts.length}.`);
    }

    const byUrl = new Map();
    let totalBytes = 0;

    for (const artifact of artifacts) {
        if (progress.isCancelled()) throw new Error("cancelled");

        if (!artifact?.sourceUrl || !await validateArtifact(artifact, format)) {
            throw new Error(`Контроль целостности не пройден: некорректный файл ${artifact?.fileName || "без имени"}.`);
        }
        if (byUrl.has(artifact.sourceUrl)) {
            throw new Error(`Контроль целостности не пройден: произведение продублировано (${artifact.sourceUrl}).`);
        }

        totalBytes += artifact.blob.size;
        byUrl.set(artifact.sourceUrl, artifact);
    }

    for (const url of workUrls) {
        if (!byUrl.has(url)) {
            throw new Error(`Контроль целостности не пройден: отсутствует файл для ${url}.`);
        }
    }

    console.info(
        `[Ficbook Exporter] Пакет: проверка успешна — ${artifacts.length}/${workUrls.length} файлов, ` +
        `${totalBytes} байт до ZIP`
    );

    progress.setStage(`Проверка пройдена: ${artifacts.length}/${workUrls.length}. Создание ZIP…`);

    const zip = new JSZip();
    const usedNames = new Set();
    const archiveEntries = [];

    for (const url of workUrls) {
        if (progress.isCancelled()) throw new Error("cancelled");
        const artifact = byUrl.get(url);
        const archiveName = uniqueArchiveName(artifact.fileName, usedNames);
        archiveEntries.push({ url, artifact, archiveName });
    }

    // Список и сами файлы идут в одном алфавитно-числовом порядке по тем
    // именам, которые реально окажутся внутри ZIP. Это упрощает сопоставление
    // записей списка с книгами даже после очистки запрещённых символов или
    // добавления суффикса к совпадающим именам.
    archiveEntries.sort((a, b) => a.archiveName.localeCompare(
        b.archiveName,
        "ru",
        { numeric: true, sensitivity: "base" }
    ));

    let listFileName = "";
    if (batchOptions?.includeList) {
        listFileName = uniqueArchiveName(BATCH_LIST_FILE_NAME, usedNames);
        const listText = createWorksListText(
            info,
            format,
            archiveEntries,
            batchOptions?.listMode === "extended" ? "extended" : "short"
        );
        // BOM нужен для корректного открытия кириллицы даже старым Блокнотом Windows.
        zip.file(listFileName, listText);
    }

    for (const entry of archiveEntries) {
        if (progress.isCancelled()) throw new Error("cancelled");
        zip.file(entry.archiveName, entry.artifact.blob);
    }

    const expectedZipEntries = workUrls.length + (batchOptions?.includeList ? 1 : 0);
    const zipEntries = Object.values(zip.files).filter(entry => !entry.dir);
    if (zipEntries.length !== expectedZipEntries) {
        throw new Error(`Контроль ZIP не пройден: ожидалось ${expectedZipEntries} файлов, добавлено ${zipEntries.length}.`);
    }

    // EPUB и PDF уже сжаты внутри, поэтому повторный DEFLATE почти не уменьшает
    // размер, но заметно нагружает браузер. FB2/TXT, наоборот, хорошо сжимаются.
    const alreadyCompressed = format === "EPUB" || format === "PDF";
    const zipOptions = {
        type: "blob",
        mimeType: "application/zip",
        compression: alreadyCompressed ? "STORE" : "DEFLATE"
    };
    if (!alreadyCompressed) zipOptions.compressionOptions = { level: 6 };

    let lastPercent = -1;
    const zipPromise = zip.generateAsync(zipOptions, meta => {
        if (progress.isCancelled()) return;
        const percent = Math.max(0, Math.min(100, Math.floor(meta?.percent || 0)));
        if (percent !== lastPercent) {
            lastPercent = percent;
            progress.setStage(`Создание ZIP: ${percent}%`);
        }
    });

    const zipBlob = await Promise.race([
        zipPromise,
        new Promise((_, reject) => {
            const check = setInterval(() => {
                if (progress.isCancelled()) {
                    clearInterval(check);
                    reject(new Error("cancelled"));
                }
            }, 250);
            zipPromise.then(
                () => clearInterval(check),
                () => clearInterval(check)
            );
        })
    ]);

    if (progress.isCancelled()) throw new Error("cancelled");
    if (!zipBlob?.size) throw new Error("ZIP получился пустым.");

    const archiveName =
        `${sanitizeFilePart(info.archiveBase, "Ficbook")}_${format}_${localDateStamp()}.zip`;
    downloadBlob(zipBlob, archiveName);

    console.info(
        `[Ficbook Exporter] Пакет: ZIP готов — ${archiveName}, ${zipBlob.size} байт, ` +
        `${workUrls.length} книг${batchOptions?.includeList ? ` + ${listFileName}` : ""}`
    );
}

async function buildArtifact(exporter, format, url, progress, workIndex, totalWorks) {
    let allowIncompleteMetadata = false;

    for (;;) {
        try {
            let batchBookInfo = null;
            const artifact = await exporter(
                (chapter, chaptersTotal) => {
                    if (progress.isCancelled()) throw new Error("cancelled");
                    progress.setChapter(chapter, chaptersTotal);
                    progress.setStage(`Загрузка главы ${chapter}/${chaptersTotal}`);
                },
                progress.isCancelled,
                {
                    workUrl: url,
                    returnFile: true,
                    allowIncompleteMetadata,
                    onBookInfo: book => {
                        if (progress.isCancelled()) throw new Error("cancelled");
                        batchBookInfo = book || null;
                        progress.setBookInfo(book);
                    },
                    onNetworkState: state => {
                        if (progress.isCancelled()) throw new Error("cancelled");
                        progress.setNetworkState(state);
                    },
                    onStage: stage => {
                        if (progress.isCancelled()) throw new Error("cancelled");
                        progress.setStage(stage);
                    }
                }
            );

            return artifact && typeof artifact === "object"
                ? { ...artifact, batchBookInfo }
                : artifact;
        } catch (error) {
            if (error?.name !== "MetadataWarningError" || allowIncompleteMetadata) throw error;

            const accepted = await confirmIncompleteMetadata(url, error.warnings, format);
            if (!accepted || progress.isCancelled()) throw new Error("cancelled");
            allowIncompleteMetadata = true;
        }
    }
}

function protectFromAccidentalClose() {
    const handler = event => {
        event.preventDefault();
        event.returnValue = "";
        return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
}

async function runBatch(exporters, info, format) {
    const exporter = exporters[format.toLowerCase()];
    if (typeof exporter !== "function") throw new Error(`Экспортёр ${format} не найден.`);

    let scanCancelled = false;
    const scan = makeOverlay("Собираем список произведений…");
    const scanStatus = document.createElement("p");
    scanStatus.className = "fbe-batch-summary";
    scanStatus.textContent = "Подготовка…";
    const scanActions = document.createElement("div");
    scanActions.className = "fbe-batch-actions";
    const scanCancel = actionButton("Отмена");
    scanCancel.addEventListener("click", () => {
        scanCancelled = true;
        scanCancel.disabled = true;
        scanCancel.textContent = "Остановка…";
    });
    scanActions.appendChild(scanCancel);
    scan.dialog.append(scanStatus, scanActions);

    let workUrls;
    let scanError = null;
    try {
        workUrls = await collectAllWorkUrls(
            info,
            status => { scanStatus.textContent = status; },
            () => scanCancelled
        );
    } catch (error) {
        if (error?.message !== "cancelled") scanError = error;
    } finally {
        scan.overlay.remove();
    }

    if (scanCancelled) return;
    if (scanError) {
        const status = Number(scanError?.status || 0);
        const suffix = status ? ` (HTTP ${status})` : "";
        await showFatalResult(
            "Не удалось дочитать список произведений",
            `Сканирование остановилось после повторных попыток${suffix}. ` +
            "Уже найденные страницы не были скачаны в архив, поэтому неполный пакет не создавался. " +
            "Попробуйте повторить позже; при временных ограничениях Ficbook экспортёр теперь делает длинные паузы автоматически."
        );
        return;
    }
    if (!workUrls.length) {
        await showFatalResult("Работы не найдены", "Не удалось найти ни одного произведения для пакетного экспорта.");
        return;
    }

    console.info(
        `[Ficbook Exporter] Пакет: найдено ${workUrls.length} произведений` +
        (info.expectedCount > 0 ? `, Ficbook сообщает ${info.expectedCount}` : "")
    );

    if (info.expectedCount > 0 && workUrls.length !== info.expectedCount) {
        // Счётчик «Работы» в профиле автора не всегда совпадает с публичным
        // списком: например, он может учитывать скрытую/недоступную работу или
        // обновляться с задержкой. Для автора используем его как справочный
        // ориентир, но не блокируем экспорт уже полностью обойдённого списка.
        if (info.type === "author") {
            console.warn(
                `[Ficbook Exporter] Счётчик профиля: ${info.expectedCount}, ` +
                `доступно в списке: ${workUrls.length}`
            );
            if (!await confirmAuthorCountMismatch(info, workUrls.length)) return;
        } else {
            await showFatalResult(
                "Количество не совпало",
                `Ficbook показывает ${info.expectedCount} работ, а экспортёр нашёл ${workUrls.length}. ` +
                "Пакет не запущен, чтобы случайно не создать неполный архив."
            );
            return;
        }
    }

    const batchOptions = await confirmBatchStart(info, format, workUrls.length);
    if (!batchOptions) return;

    const progress = createProgressDialog(info, format, workUrls.length);
    const removeCloseProtection = protectFromAccidentalClose();
    const artifacts = [];
    const failed = [];

    try {
        for (let index = 0; index < workUrls.length; index++) {
            if (progress.isCancelled()) throw new Error("cancelled");
            const url = workUrls[index];
            progress.setWork(index + 1, url);

            let artifact = null;
            let lastError = null;

            // Одна дополнительная попытка всей работы. Внутри collectBook главы
            // уже имеют собственные повторные попытки и защитные задержки.
            for (let attempt = 1; attempt <= 2 && !artifact; attempt++) {
                if (progress.isCancelled()) throw new Error("cancelled");
                try {
                    artifact = await buildArtifact(
                        exporter,
                        format,
                        url,
                        progress,
                        index + 1,
                        workUrls.length
                    );
                } catch (error) {
                    if (error?.message === "cancelled") throw error;
                    lastError = error;
                    console.warn(
                        `[Ficbook Exporter] Пакет: ошибка произведения ${index + 1}/${workUrls.length}, попытка ${attempt}/2`,
                        url,
                        error
                    );
                    if (attempt < 2) {
                        progress.setStage("Ошибка. Повтор произведения после паузы…");
                        await randomDelay(WHOLE_WORK_RETRY_MIN_MS, WHOLE_WORK_RETRY_MAX_MS, progress.isCancelled);
                    }
                }
            }

            if (artifact?.blob instanceof Blob && artifact?.fileName) {
                artifacts.push({ ...artifact, sourceUrl: normalizeWorkUrl(artifact.sourceUrl || url) || url });
            } else {
                if (artifact) lastError = new Error("Экспортёр вернул некорректный файл.");
                failed.push({ url, error: lastError });
            }

            if (index < workUrls.length - 1 && !progress.isCancelled()) {
                progress.setStage("Пауза между произведениями…");
                await randomDelay(BETWEEN_WORKS_MIN_MS, BETWEEN_WORKS_MAX_MS, progress.isCancelled);
            }
        }

        if (progress.isCancelled()) throw new Error("cancelled");
        progress.setFinished();

        if (failed.length || artifacts.length !== workUrls.length) {
            progress.close();
            await showFatalResult(
                "Архив не создан",
                `Успешно: ${artifacts.length}/${workUrls.length}. Ошибок: ${failed.length}. ` +
                "Неполный ZIP не сохранён.",
                failed
            );
            return;
        }

        await createArchive(info, format, workUrls, artifacts, progress, batchOptions);
        progress.close();
    } catch (error) {
        progress.close();
        if (error?.message !== "cancelled") {
            console.error("Ошибка пакетного экспорта:", error);
            await showFatalResult("Ошибка пакетного экспорта", error?.message || String(error));
        }
    } finally {
        removeCloseProtection();
    }
}

function placementForPage() {
    if (supportsAuthorBatchButtons()) {
        // Ficbook периодически меняет обёртку боковой навигации профиля.
        // Раньше nav находился внутри .sidebar-sticky, теперь на части страниц
        // эта обёртка отсутствует. Ищем сам .sidebar-nav в пределах профиля,
        // сохраняя старый селектор как первый вариант для совместимости.
        const nav = document.querySelector(
            ".sidebar-sticky .sidebar-nav, .page-with-sidebar .sidebar-nav, .sidebar-nav"
        );
        if (!nav?.parentElement) return null;
        return { parent: nav.parentElement, after: nav, mode: "sidebar" };
    }

    if (isCollectionPage()) {
        const filters = document.querySelector("#filters");
        if (filters?.parentElement) {
            return { parent: filters.parentElement, after: filters, mode: "collection" };
        }

        const heading = document.querySelector(".collections-page-heading");
        const row = heading?.parentElement;
        if (!row) return null;
        return { parent: row, after: null, mode: "heading" };
    }

    if (isSeriesPage()) {
        const heading = document.querySelector("h1.heading.word-break, h1.heading");
        const headerBlock = heading?.closest(".d-flex.flex-column.gap-8");

        if (headerBlock) {
            const summary = Array.from(headerBlock.children).find(node =>
                /В\s+серии\s+\d+\s+работ/i.test(node.textContent || "")
            );

            if (summary) {
                return { parent: headerBlock, after: summary, mode: "series" };
            }
        }

        // Резервный вариант на случай изменения разметки Ficbook.
        const row = heading?.parentElement?.parentElement;
        if (!row) return null;
        return { parent: row, after: null, mode: "heading" };
    }

    return null;
}

function createBatchControl(exporters, info) {
    const control = document.createElement("div");
    control.className = "fbe-batch-control";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "ds-btn ds-btn-regular ds-btn-mini fbe-batch-trigger";
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = `<span>${info.buttonText}</span><span class="fbe-batch-trigger-chevron" aria-hidden="true">▼</span>`;

    const menu = document.createElement("div");
    menu.className = "fbe-batch-menu";
    menu.setAttribute("role", "menu");

    const closeMenu = () => {
        menu.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
    };

    for (const format of ["FB2", "EPUB", "PDF", "TXT"]) {
        const item = document.createElement("button");
        item.type = "button";
        item.textContent = `${info.buttonText} → ${format}`;
        item.addEventListener("click", event => {
            event.stopPropagation();
            closeMenu();
            runBatch(exporters, info, format).catch(error => {
                console.error("Ошибка пакетного экспорта:", error);
            });
        });
        menu.appendChild(item);
    }

    trigger.addEventListener("click", event => {
        event.stopPropagation();

        const root = control.closest(`#${BATCH_ROOT_ID}`);
        root?.querySelectorAll(".fbe-batch-menu.is-open").forEach(openMenu => {
            if (openMenu !== menu) {
                openMenu.classList.remove("is-open");
                openMenu.parentElement?.querySelector(".fbe-batch-trigger")?.setAttribute("aria-expanded", "false");
            }
        });

        const open = menu.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    control.append(menu, trigger);
    return control;
}

export function createBatchExportButtons(exporters) {
    const infos = pageInfos();
    if (!infos.length) return false;
    if (document.getElementById(BATCH_ROOT_ID)) return true;

    const placement = placementForPage();
    if (!placement?.parent) return false;
    installStyles();

    const root = document.createElement("div");
    root.id = BATCH_ROOT_ID;
    root.className =
        placement.mode === "sidebar"
            ? "fbe-batch-sidebar"
            : placement.mode === "collection"
                ? "fbe-batch-collection"
                : placement.mode === "series"
                    ? "fbe-batch-series"
                    : "fbe-batch-heading";

    infos.forEach(info => root.appendChild(createBatchControl(exporters, info)));

    document.addEventListener("click", event => {
        if (root.contains(event.target)) return;
        root.querySelectorAll(".fbe-batch-menu.is-open").forEach(menu => {
            menu.classList.remove("is-open");
            menu.parentElement?.querySelector(".fbe-batch-trigger")?.setAttribute("aria-expanded", "false");
        });
    });

    if (placement.after) placement.after.insertAdjacentElement("afterend", root);
    else placement.parent.appendChild(root);

    return true;
}
