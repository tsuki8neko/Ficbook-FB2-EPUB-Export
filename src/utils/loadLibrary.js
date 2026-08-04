const pendingLoads = new Map();

function requestText(url) {
    const gmRequest = globalThis.GM_xmlhttpRequest || globalThis.GM?.xmlHttpRequest;
    if (gmRequest) {
        return new Promise((resolve, reject) => {
            gmRequest({
                method: "GET",
                url,
                responseType: "text",
                timeout: 30000,
                onload: response => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(response.responseText || response.response);
                    } else {
                        reject(new Error(`HTTP ${response.status}: ${url}`));
                    }
                },
                onerror: () => reject(new Error(`Не удалось загрузить библиотеку: ${url}`)),
                ontimeout: () => reject(new Error(`Тайм-аут загрузки библиотеки: ${url}`))
            });
        });
    }

    return fetch(url).then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
        return response.text();
    });
}

function findGlobal(globalName) {
    if (!globalName) return undefined;

    const roots = [
        globalThis,
        typeof window !== "undefined" ? window : undefined,
        typeof unsafeWindow !== "undefined" ? unsafeWindow : undefined
    ];

    for (const root of roots) {
        if (root && root[globalName]) return root[globalName];
    }
    return undefined;
}

function meaningfulExport(value) {
    if (!value) return undefined;
    if (typeof value === "function") return value;
    if (typeof value !== "object") return value;
    if (value.default) return value.default;
    if (Object.keys(value).length) return value;
    return undefined;
}

/**
 * Выполняет браузерную UMD-сборку как CommonJS-модуль.
 * Это важно для Tampermonkey: обычный indirect eval может выполнить код в
 * другом global scope, из-за чего window.JSZip/pdfMake не видны userscript.
 */
function executeUmd(source, url, globalName) {
    const module = { exports: {} };
    const exports = module.exports;
    const setImmediateShim = typeof globalThis.setImmediate === "function"
        ? globalThis.setImmediate.bind(globalThis)
        : (callback, ...args) => setTimeout(callback, 0, ...args);
    const clearImmediateShim = typeof globalThis.clearImmediate === "function"
        ? globalThis.clearImmediate.bind(globalThis)
        : handle => clearTimeout(handle);

    // JSZip использует setImmediate в одной из веток UMD/CommonJS.
    // В браузерном sandbox Tampermonkey этого API может не быть.
    try {
        if (typeof globalThis.setImmediate !== "function") globalThis.setImmediate = setImmediateShim;
        if (typeof globalThis.clearImmediate !== "function") globalThis.clearImmediate = clearImmediateShim;
    } catch (_) {
        // Даже если запись в globalThis запрещена, параметры runner остаются доступны модулю.
    }

    const runner = new Function(
        "module",
        "exports",
        "define",
        "require",
        "global",
        "window",
        "self",
        "setImmediate",
        "clearImmediate",
        `${source}\n//# sourceURL=${url}`
    );

    runner.call(
        globalThis,
        module,
        exports,
        undefined,
        undefined,
        globalThis,
        globalThis,
        globalThis,
        setImmediateShim,
        clearImmediateShim
    );

    const exported = meaningfulExport(module.exports);
    const existing = findGlobal(globalName);
    const library = existing || exported;

    if (globalName && library && !globalThis[globalName]) {
        try {
            globalThis[globalName] = library;
        } catch (_) {
            // Достаточно вернуть объект напрямую, если sandbox запрещает запись.
        }
    }

    return findGlobal(globalName) || library || true;
}

async function loadOne(url, globalName) {
    const existing = findGlobal(globalName);
    if (existing) return existing;

    if (!pendingLoads.has(url)) {
        pendingLoads.set(url, (async () => {
            const source = await requestText(url);
            return executeUmd(source, url, globalName);
        })());
    }

    try {
        const result = await pendingLoads.get(url);
        if (globalName && !findGlobal(globalName) && !result) {
            throw new Error(`Библиотека загружена, но объект ${globalName} не появился.`);
        }
        return findGlobal(globalName) || result;
    } catch (error) {
        pendingLoads.delete(url);
        throw error;
    }
}

/**
 * Лениво загружает внешний UMD-скрипт в userscript sandbox.
 * Можно передать несколько CDN-адресов: следующий используется при ошибке.
 */
export async function loadExternalScript(urlOrUrls, globalName = "") {
    const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
    const errors = [];

    for (const url of urls) {
        try {
            return await loadOne(url, globalName);
        } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error));
        }
    }

    throw new Error(`Не удалось загрузить внешнюю библиотеку:\n${errors.join("\n")}`);
}
