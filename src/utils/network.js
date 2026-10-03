import { delay } from "./delay.js";

function cancelledError() {
    return new Error("cancelled");
}

function isOffline() {
    return typeof navigator !== "undefined" && navigator.onLine === false;
}

export async function waitForOnline({
    isCancelled = () => false,
    onState = () => {}
} = {}) {
    if (!isOffline()) return;

    onState("Нет соединения с интернетом — ждём восстановления…");

    while (isOffline()) {
        if (isCancelled()) throw cancelledError();
        await delay(1000);
    }

    if (isCancelled()) throw cancelledError();
    onState("Соединение восстановлено. Продолжаем…");
    await delay(350);
}

function timeoutError(timeoutMs) {
    const error = new Error(`Запрос не завершился за ${Math.round(timeoutMs / 1000)} секунд.`);
    error.name = "NetworkTimeoutError";
    error.retryable = true;
    return error;
}

export async function fetchTextWithRetries(url, {
    credentials = "same-origin",
    isCancelled = () => false,
    onState = () => {},
    maxAttempts = 5,
    retryBaseMs = 1000,
    retryJitterMs = 500,
    requestTimeoutMs = 45000,
    validateText = null
} = {}) {
    let attempt = 1;

    for (;;) {
        if (isCancelled()) throw cancelledError();
        await waitForOnline({ isCancelled, onState });
        if (isCancelled()) throw cancelledError();

        let timeoutId = null;
        const controller = typeof AbortController === "function" ? new AbortController() : null;

        try {
            if (controller && requestTimeoutMs > 0) {
                timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
            }

            const response = await fetch(url, {
                credentials,
                ...(controller ? { signal: controller.signal } : {})
            });

            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}`);
                error.status = response.status;
                throw error;
            }

            const text = await response.text();
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            if (isCancelled()) throw cancelledError();

            if (typeof validateText === "function") {
                const result = await validateText(text, response);
                if (result === false) {
                    const error = new Error("Получен неполный или некорректный ответ сервера.");
                    error.retryable = true;
                    throw error;
                }
            }

            onState("");
            return { response, text };
        } catch (error) {
            if (timeoutId !== null) clearTimeout(timeoutId);
            if (error?.message === "cancelled" || isCancelled()) throw cancelledError();

            if (error?.name === "AbortError") {
                error = timeoutError(requestTimeoutMs);
            }

            // Если браузер уже знает, что сети нет, не расходуем попытки:
            // ждём восстановления и повторяем тот же запрос.
            if (isOffline()) {
                await waitForOnline({ isCancelled, onState });
                continue;
            }

            const retryableStatus = error?.retryable === true || !error?.status ||
                error.status === 408 || error.status === 425 ||
                error.status === 429 || error.status >= 500;

            if (!retryableStatus || attempt >= maxAttempts) throw error;

            const nextAttempt = attempt + 1;
            onState(`Ошибка сети/сервера. Повтор ${nextAttempt}/${maxAttempts}…`);
            await delay(retryBaseMs * attempt + Math.random() * retryJitterMs);
            attempt = nextAttempt;
        }
    }
}
