const COVER_SELECTORS = [
    // Сначала берём крупную картинку из фактического блока обложки.
    ".fanfic-hat-cover picture img",
    ".fanfic-hat-cover img",
    ".fanfic-cover picture img",
    ".fanfic-cover img",
    "img[itemprop='image']",
    "[itemprop='image'] img",
    ".fanfic-hat-body img[class*='cover']",
    "img[class*='fanfic'][class*='cover']",
    // Open Graph остаётся резервным вариантом: на Ficbook там часто уменьшенная m_-версия.
    "meta[property='og:image']",
    "meta[name='twitter:image']"
];

function candidateFromNode(node) {
    if (!node) return "";
    if (node.tagName?.toLowerCase() === "meta") return node.getAttribute("content") || "";

    const srcset = node.getAttribute("srcset") || node.getAttribute("data-srcset") || "";
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
                return { url, score: Number.isFinite(score) ? score : 0 };
            })
            .filter(item => item.url);
        candidates.sort((a, b) => b.score - a.score);
        if (candidates[0]?.url) return candidates[0].url;
    }

    return node.getAttribute("data-src") || node.getAttribute("src") || "";
}

function absoluteUrl(value, doc = document) {
    if (!value) return "";
    try {
        const fallbackBase = location.origin && location.origin !== "null"
            ? location.origin
            : "https://ficbook.net";
        const base = doc.baseURI && doc.baseURI !== "about:blank" ? doc.baseURI : fallbackBase;
        return new URL(value, base).href;
    } catch (_) {
        return "";
    }
}

export function findCoverUrl(doc = document) {
    for (const selector of COVER_SELECTORS) {
        const value = candidateFromNode(doc.querySelector(selector));
        if (!value || value.startsWith("data:")) continue;

        const href = absoluteUrl(value, doc);
        if (!href) continue;

        try {
            const url = new URL(href);
            if (/avatar|logo|favicon|default[-_]?cover|no[-_]?cover/i.test(url.pathname)) continue;
            return url.href;
        } catch (_) {
            // Пробуем следующий селектор.
        }
    }
    return "";
}

function headerValue(headers, name) {
    const match = String(headers || "").match(new RegExp(`^${name}:\\s*(.+)$`, "im"));
    return match?.[1]?.trim() || "";
}

function gmRequestBlob(url) {
    return new Promise((resolve, reject) => {
        const request = globalThis.GM_xmlhttpRequest || globalThis.GM?.xmlHttpRequest;
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
                if (response.status < 200 || response.status >= 300 || !response.response) {
                    reject(new Error(`HTTP ${response.status}`));
                    return;
                }

                const contentType = headerValue(response.responseHeaders, "content-type") || "application/octet-stream";
                resolve(new Blob([response.response], { type: contentType }));
            },
            onerror: () => reject(new Error("Ошибка загрузки обложки")),
            ontimeout: () => reject(new Error("Тайм-аут загрузки обложки"))
        });
    });
}

async function fetchBlob(url) {
    // Сначала пробуем GM-запрос: он не зависит от CORS страницы Ficbook.
    try {
        return await gmRequestBlob(url);
    } catch (gmError) {
        try {
            const response = await fetch(url, { credentials: "omit", mode: "cors" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.blob();
        } catch (fetchError) {
            throw new Error(`Не удалось скачать обложку: ${gmError.message}; ${fetchError.message}`);
        }
    }
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
            reject(new Error("Браузер не смог декодировать изображение"));
        };
        image.src = objectUrl;
    });
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Не удалось преобразовать обложку")), type, quality);
    });
}

async function normalizeToJpeg(blob) {
    const image = await loadImage(blob);
    const maxWidth = 1600;
    const maxHeight = 2400;
    const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Canvas 2D недоступен");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return { blob: await canvasToBlob(canvas, "image/jpeg", 0.9), width, height };
}

function bytesToBase64(bytes) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

export async function getCover(doc = document) {
    const sourceUrl = findCoverUrl(doc);
    if (!sourceUrl) return null;

    try {
        const originalBlob = await fetchBlob(sourceUrl);
        const normalized = await normalizeToJpeg(originalBlob);
        const bytes = new Uint8Array(await normalized.blob.arrayBuffer());
        const base64 = bytesToBase64(bytes);

        return {
            sourceUrl,
            blob: normalized.blob,
            bytes,
            base64,
            dataUrl: `data:image/jpeg;base64,${base64}`,
            mediaType: "image/jpeg",
            fileName: "cover.jpg",
            width: normalized.width,
            height: normalized.height
        };
    } catch (error) {
        console.warn("Обложка найдена, но не добавлена:", sourceUrl, error);
        return null;
    }
}
