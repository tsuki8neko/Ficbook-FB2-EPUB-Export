const REAL_COVER_SELECTOR =
    ".fanfic-hat-cover picture img, " +
    ".fanfic-hat-cover img";

/*
 * Кэшируем уже скачанную и нормализованную обложку на время жизни страницы.
 * Это особенно заметно, если пользователь подряд экспортирует одну работу
 * в несколько форматов: повторно CDN и Canvas уже не трогаем.
 */
const normalizedCoverCache = new Map();

function nowMs() {
    return typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
}

function logTiming(label, startedAt) {
    const elapsed = Math.max(0, nowMs() - startedAt);
    console.info(`[Ficbook Exporter] Обложка: ${label} — ${elapsed.toFixed(0)} мс`);
}

function candidateFromNode(node) {
    if (!node) return "";

    /*
     * currentSrc — фактический ресурс, который браузер уже выбрал и
     * загрузил из <picture>/<source>. Используем его первым, чтобы
     * cache-first запрос совпадал с URL уже отображаемой обложки.
     */
    if (node.currentSrc) {
        return node.currentSrc;
    }

    const srcset =
        node.getAttribute("srcset") ||
        node.getAttribute("data-srcset") ||
        "";

    if (srcset) {
        const candidates = srcset
            .split(",")
            .map(part => {
                const [url, descriptor = ""] = part.trim().split(/\s+/, 2);

                const score = descriptor.endsWith("w")
                    ? Number.parseFloat(descriptor)
                    : descriptor.endsWith("x")
                        ? Number.parseFloat(descriptor) * 10000
                        : 0;

                return {
                    url,
                    score: Number.isFinite(score) ? score : 0
                };
            })
            .filter(item => item.url);

        candidates.sort((a, b) => b.score - a.score);

        if (candidates[0]?.url) {
            return candidates[0].url;
        }
    }

    return (
        node.getAttribute("data-src") ||
        node.getAttribute("src") ||
        ""
    );
}

function absoluteUrl(value, doc = document) {
    if (!value) return "";

    try {
        const fallbackBase =
            location.origin && location.origin !== "null"
                ? location.origin
                : "https://ficbook.net";

        const base =
            doc.baseURI && doc.baseURI !== "about:blank"
                ? doc.baseURI
                : fallbackBase;

        return new URL(value, base).href;
    } catch (_) {
        return "";
    }
}

function isRealFicbookCover(value) {
    if (!value) return false;

    try {
        const url = new URL(value);

        if (!url.pathname.includes("/fanfic-covers/")) {
            return false;
        }

        if (
            /avatar|logo|favicon|placeholder|default|no[-_]?cover/i.test(
                url.pathname
            )
        ) {
            return false;
        }

        return true;
    } catch (_) {
        return false;
    }
}

export function findCoverUrl(doc = document) {
    const coverRoot = doc.querySelector(".fanfic-hat-cover");
    if (!coverRoot) return "";

    const image = doc.querySelector(REAL_COVER_SELECTOR);
    if (!image) return "";

    const value = candidateFromNode(image);

    if (!value || value.startsWith("data:")) {
        return "";
    }

    const href = absoluteUrl(value, doc);

    if (!isRealFicbookCover(href)) {
        return "";
    }

    return href;
}

function headerValue(headers, name) {
    const match = String(headers || "").match(
        new RegExp(`^${name}:\\s*(.+)$`, "im")
    );

    return match?.[1]?.trim() || "";
}

function gmRequestBlob(url) {
    return new Promise((resolve, reject) => {
        const request =
            globalThis.GM_xmlhttpRequest ||
            globalThis.GM?.xmlHttpRequest;

        if (!request) {
            reject(new Error("GM_xmlhttpRequest недоступен"));
            return;
        }

        request({
            method: "GET",
            url,
            responseType: "arraybuffer",
            timeout: 30000,

            onload: response => {
                if (
                    response.status < 200 ||
                    response.status >= 300 ||
                    !response.response
                ) {
                    reject(new Error(`HTTP ${response.status}`));
                    return;
                }

                const contentType =
                    headerValue(
                        response.responseHeaders,
                        "content-type"
                    ) || "application/octet-stream";

                if (!contentType.toLowerCase().startsWith("image/")) {
                    reject(
                        new Error(
                            `Получен неподходящий тип файла: ${contentType}`
                        )
                    );
                    return;
                }

                resolve(
                    new Blob(
                        [response.response],
                        { type: contentType }
                    )
                );
            },

            onerror: () => {
                reject(new Error("Ошибка загрузки обложки"));
            },

            ontimeout: () => {
                reject(new Error("Тайм-аут загрузки обложки"));
            }
        });
    });
}

async function fetchBlob(url) {
    /*
     * assets.teinon.net не разрешает CORS для браузерного fetch со страницы
     * ficbook.net. Поэтому не делаем заведомо неуспешную cache-first попытку:
     * сразу используем GM_xmlhttpRequest, которому CORS не мешает.
     *
     * Кэш нормализованной обложки текущей страницы остаётся выше по цепочке
     * в normalizedCoverCache, поэтому повторный экспорт той же работы всё равно
     * использует уже готовую обложку без сетевого запроса.
     */
    const blob = await gmRequestBlob(url);
    console.info(
        `[Ficbook Exporter] Обложка: GM-запрос — ${blob.size} байт`
    );
    return blob;
}

function loadImage(blob) {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(blob);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);

            reject(
                new Error(
                    "Браузер не смог декодировать изображение"
                )
            );
        };

        image.src = objectUrl;
    });
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(
                        new Error(
                            "Не удалось преобразовать обложку"
                        )
                    );
                }
            },
            type,
            quality
        );
    });
}

async function normalizeToJpeg(blob, onStage) {
    onStage("декодирование");
    const decodeStarted = nowMs();
    const image = await loadImage(blob);
    logTiming("декодирование", decodeStarted);

    if (!image.naturalWidth || !image.naturalHeight) {
        throw new Error("Изображение имеет нулевой размер");
    }

    const maxWidth = 1600;
    const maxHeight = 2400;

    const scale = Math.min(
        1,
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight
    );

    const width = Math.max(
        1,
        Math.round(image.naturalWidth * scale)
    );

    const height = Math.max(
        1,
        Math.round(image.naturalHeight * scale)
    );

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
        alpha: false
    });

    if (!context) {
        throw new Error("Canvas 2D недоступен");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    onStage("JPEG");
    const jpegStarted = nowMs();
    const jpegBlob = await canvasToBlob(
        canvas,
        "image/jpeg",
        0.9
    );
    logTiming("JPEG", jpegStarted);

    return {
        blob: jpegBlob,
        width,
        height
    };
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error || new Error("Не удалось прочитать обложку"));
        reader.readAsDataURL(blob);
    });
}

async function getNormalizedCover(sourceUrl, onStage) {
    if (normalizedCoverCache.has(sourceUrl)) {
        onStage("кэш");
        console.info("[Ficbook Exporter] Обложка: использован кэш текущей страницы");
        return normalizedCoverCache.get(sourceUrl);
    }

    const promise = (async () => {
        onStage("загрузка");
        const downloadStarted = nowMs();
        const originalBlob = await fetchBlob(sourceUrl);
        logTiming("загрузка", downloadStarted);

        const normalizeStarted = nowMs();
        const normalized = await normalizeToJpeg(originalBlob, onStage);
        logTiming("обработка всего изображения", normalizeStarted);

        return normalized;
    })();

    normalizedCoverCache.set(sourceUrl, promise);

    try {
        return await promise;
    } catch (error) {
        normalizedCoverCache.delete(sourceUrl);
        throw error;
    }
}

export async function getCover(doc = document, options = {}) {
    const mode = options.mode || "full";
    const onStage = typeof options.onStage === "function" ? options.onStage : () => {};

    if (mode === "none") return null;

    const sourceUrl = findCoverUrl(doc);
    if (!sourceUrl) return null;

    const totalStarted = nowMs();

    try {
        const normalized = await getNormalizedCover(sourceUrl, onStage);
        const common = {
            sourceUrl,
            blob: normalized.blob,
            mediaType: "image/jpeg",
            fileName: "cover.jpg",
            width: normalized.width,
            height: normalized.height
        };

        if (mode === "epub") {
            onStage("байты EPUB");
            const started = nowMs();
            const bytes = new Uint8Array(await normalized.blob.arrayBuffer());
            logTiming("подготовка EPUB", started);
            logTiming("всего", totalStarted);
            return { ...common, bytes };
        }

        if (mode === "fb2") {
            onStage("Base64 FB2");
            const started = nowMs();
            const dataUrl = await blobToDataUrl(normalized.blob);
            const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
            logTiming("подготовка FB2", started);
            logTiming("всего", totalStarted);
            return { ...common, base64 };
        }

        if (mode === "pdf") {
            onStage("данные PDF");
            const started = nowMs();
            const dataUrl = await blobToDataUrl(normalized.blob);
            logTiming("подготовка PDF", started);
            logTiming("всего", totalStarted);
            return { ...common, dataUrl };
        }

        /* Режим совместимости для сторонних вызовов getCover(). */
        onStage("полная подготовка");
        const started = nowMs();
        const bytes = new Uint8Array(await normalized.blob.arrayBuffer());
        const dataUrl = await blobToDataUrl(normalized.blob);
        const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
        logTiming("полная подготовка", started);
        logTiming("всего", totalStarted);
        return { ...common, bytes, base64, dataUrl };
    } catch (error) {
        console.warn(
            "Обложка найдена, но не добавлена:",
            sourceUrl,
            error
        );

        return null;
    }
}
