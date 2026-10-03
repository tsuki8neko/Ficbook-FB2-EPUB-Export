/*
 * JSZip internally yields work through setImmediate.
 *
 * In Tampermonkey the exposed setImmediate can be unreliable, while a
 * setTimeout(0)-based replacement becomes extremely slow as soon as Chrome
 * puts the page into a background tab (background timers are throttled).
 *
 * MessageChannel schedules tasks without depending on timer clamping, so it
 * is a better fit for JSZip here. setTimeout remains only as a fallback.
 */
let nextHandle = 1;
const pending = new Map();
const queue = [];
let channel = null;

try {
    const MessageChannelCtor =
        (typeof globalThis !== "undefined" && globalThis.MessageChannel) ||
        (typeof window !== "undefined" && window.MessageChannel) ||
        null;

    if (typeof MessageChannelCtor === "function") {
        channel = new MessageChannelCtor();
        channel.port1.onmessage = () => {
            while (queue.length) {
                const handle = queue.shift();
                const task = pending.get(handle);
                if (!task) continue;

                pending.delete(handle);
                try {
                    task.callback(...task.args);
                } catch (error) {
                    // Не ломаем очередь JSZip. Ошибку всё равно отдаём в event loop.
                    setTimeout(() => { throw error; }, 0);
                }
                break;
            }

            if (queue.length) channel.port2.postMessage(0);
        };
        channel.port1.start?.();
    }
} catch (_) {
    channel = null;
}

function safeSetImmediate(callback, ...args) {
    if (!channel) return setTimeout(() => callback(...args), 0);

    const handle = nextHandle++;
    pending.set(handle, { callback, args });
    queue.push(handle);
    channel.port2.postMessage(0);
    return handle;
}

function safeClearImmediate(handle) {
    if (!channel) {
        clearTimeout(handle);
        return;
    }
    pending.delete(handle);
}

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

console.info(
    `[Ficbook Exporter] JSZip scheduler: ${channel ? "MessageChannel" : "setTimeout fallback"}`
);
