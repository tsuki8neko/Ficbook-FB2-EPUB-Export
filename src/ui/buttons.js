/**
 * UI-кнопки для экспорта фанфика:
 * - FB2
 * - EPUB
 * - остановка всех активных загрузок
 *
 * Также управляет состоянием:
 * - параллельные загрузки
 * - отмена процессов
 * - обновление UI во время скачивания
 */

export function createButtons(createFB2, createEPUB) {

    // === ГЛОБАЛЬНЫЙ СЧЁТЧИК АКТИВНЫХ ЗАГРУЗОК ===
    // для отображения кнопки "Остановить"
    let activeDownloads = 0;

    function updateStopButton() {
        stopBtn.style.display = activeDownloads > 0 ? "block" : "none";
    }

    // === КОНТЕЙНЕР UI ===
    const container = document.createElement("div");
    container.id = "ficbook-export-buttons";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "10000";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";

    /**
     * Вспомогательная функция создания кнопок с единым стилем
     */
    function createButton(label, bgColor) {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.style.padding = "8px 12px";
        btn.style.borderRadius = "999px";
        btn.style.border = "none";
        btn.style.cursor = "pointer";
        btn.style.background = bgColor;
        btn.style.color = "#fff";
        btn.style.fontSize = "13px";
        btn.style.fontWeight = "600";
        btn.style.opacity = "0.9";
        btn.style.transition = "opacity 0.15s ease, transform 0.1s ease";
        return btn;
    }

    const fb2Btn = createButton("Скачать FB2", "#3b82f6");
    const epubBtn = createButton("Скачать EPUB", "#16a34a");
    const stopBtn = createButton("Остановить загрузку", "#dc2626");
    stopBtn.style.display = "none";

    // === ГЛОБАЛЬНАЯ ОТМЕНА ВСЕХ ЗАГРУЗОК ===
    let cancelCallbacks = [];

    // вызываем все зарегистрированные cancel-функции
    stopBtn.onclick = () => {
        stopBtn.textContent = "Остановка...";
        cancelCallbacks.forEach(cb => cb());
        cancelCallbacks = [];
        activeDownloads = 0;
        updateStopButton();
    };

    // === ОБЁРТКА ДЛЯ ЗАПУСКА ЛЮБОЙ ЗАГРУЗКИ ===
    function runDownload(startFn, button, label) {
        let cancelled = false;

        // Регистрируем отмену
        cancelCallbacks.push(() => cancelled = true);

        activeDownloads++;
        updateStopButton();

        button.disabled = true;
        button.textContent = label;

        startFn(
            (current, total) => {
                if (cancelled) throw new Error("cancelled");
                // Обновление прогресса загрузки
                button.textContent = `${label}: Загружается глава ${current}/${total}`;
            },
            () => cancelled
        )
            .catch(err => {
                if (err.message === "cancelled") {
                    button.textContent = "Отменено";
                }
            })
            .finally(() => {

                // Удаляем callback отмены
                cancelCallbacks = cancelCallbacks.filter(cb => cb !== (() => cancelled = true));

                activeDownloads--;
                updateStopButton();

                button.disabled = false;
                button.textContent = label;
                stopBtn.textContent = "Остановить загрузку";
            });
    }

    // === FB2 экспорт ===
    fb2Btn.onclick = () => {
        runDownload(createFB2, fb2Btn, "Скачать FB2");
    };

    // === EPUB экспорт ===
    epubBtn.onclick = () => {
        runDownload(createEPUB, epubBtn, "Скачать EPUB");
    };

    container.appendChild(stopBtn);
    container.appendChild(fb2Btn);
    container.appendChild(epubBtn);
    document.body.appendChild(container);
}
