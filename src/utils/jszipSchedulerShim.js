/*
 * JSZip internally yields work through setImmediate.
 * Tampermonkey's sandbox can expose a setImmediate implementation whose
 * callbacks never fire. Install a predictable setTimeout-backed scheduler
 * before the jszip package is evaluated.
 */
const safeSetImmediate = (callback, ...args) =>
    setTimeout(() => callback(...args), 0);

const safeClearImmediate = handle => clearTimeout(handle);

const roots = [];
try { if (typeof globalThis !== "undefined") roots.push(globalThis); } catch (_) {}
try { if (typeof window !== "undefined") roots.push(window); } catch (_) {}
try { if (typeof self !== "undefined") roots.push(self); } catch (_) {}

for (const root of [...new Set(roots)]) {
    try {
        Object.defineProperty(root, "setImmediate", {
            configurable: true,
            writable: true,
            value: safeSetImmediate
        });
        Object.defineProperty(root, "clearImmediate", {
            configurable: true,
            writable: true,
            value: safeClearImmediate
        });
    } catch (_) {
        try { root.setImmediate = safeSetImmediate; } catch (_) {}
        try { root.clearImmediate = safeClearImmediate; } catch (_) {}
    }
}

console.info("[Ficbook Exporter] JSZip scheduler: setImmediate -> setTimeout shim");
