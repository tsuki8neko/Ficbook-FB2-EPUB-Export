/**
 * Встраивает компактную кнопку экспорта в штатную панель действий Ficbook.
 * Список форматов открывается рядом с кнопкой и не зависит от плавающих кнопок сайта.
 */
export function createButtons(exporters) {
    const cleanupKey = "__ficbookExporterUiCleanup";
    if (typeof window[cleanupKey] === "function") window[cleanupKey]();

    // Удаляем интерфейс предыдущей версии, если скрипт был обновлён без перезагрузки страницы.
    document.querySelectorAll("#ficbook-export-buttons").forEach(element => element.remove());
    document.querySelector("#ficbook-export-ui-style")?.remove();

    const actionsContainer = document.querySelector(
        "section.chapter-info .hat-actions-container, .hat-actions-container"
    );
    if (!actionsContainer) return false;

    /**
     * Ищет основную строку действий Ficbook — ту, где находятся лайки,
     * отметки, комментарии и награды.
     */
    function findPlacement() {
        const currentContainer = document.querySelector(
            "section.chapter-info .hat-actions-container, .hat-actions-container"
        );
        if (!currentContainer) return null;

        const directRows = Array.from(currentContainer.children).filter(element =>
            element.matches?.(".d-flex.flex-wrap")
        );
        const rows = directRows.length
            ? directRows
            : Array.from(currentContainer.querySelectorAll(".d-flex.flex-wrap"));

        const primaryActionsRow = rows.find(row =>
            row.querySelector(
                ".ds-btn-primary, .js-marks-plus, .js-reward-count, " +
                "a[href*='/comments'], .ic_thumbs-up, .ic-star-empty, .ic_star-empty"
            ) &&
            !row.querySelector("a[href*='/collections/'], .button-container")
        );

        const fallbackRow = primaryActionsRow ||
            directRows[0] ||
            currentContainer.querySelector(".d-flex.flex-wrap") ||
            currentContainer.querySelector(".d-flex") ||
            currentContainer;

        return { row: fallbackRow };
    }

    const style = document.createElement("style");
    style.id = "ficbook-export-ui-style";
    style.textContent = `
#ficbook-export-buttons {
    position: relative;
    display: inline-flex;
    flex: 0 0 auto;
    z-index: 60;
    font-family: inherit;
}
#ficbook-export-buttons *,
#ficbook-export-buttons *::before,
#ficbook-export-buttons *::after {
    box-sizing: border-box;
}
.fbe-inline-trigger {
    width: 148px;
    min-width: 148px;
    max-width: 148px;
    justify-content: center;
    gap: 5px;
    overflow: hidden;
    white-space: nowrap;
    background: #4f86c6 !important;
    border: 1px solid #2f639d !important;
    color: #ffffff !important;
    font-weight: 700;
    transition: background-color .15s ease, border-color .15s ease;
}
.fbe-inline-trigger:hover,
.fbe-inline-trigger:focus-visible,
.fbe-inline-trigger[aria-expanded="true"] {
    background: #356da9 !important;
    border-color: #244f7c !important;
    color: #ffffff !important;
}
.fbe-inline-trigger-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}
.fbe-inline-trigger.is-busy {
    cursor: pointer;
}
.fbe-inline-trigger-chevron {
    margin-left: 1px;
    font-size: 9px;
    line-height: 1;
    opacity: .8;
    transition: transform .15s ease;
}
.fbe-inline-trigger[aria-expanded="true"] .fbe-inline-trigger-chevron {
    transform: rotate(180deg);
}
.fbe-inline-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    display: none;
    min-width: 154px;
    padding: 5px;
    border: 1px solid rgba(64, 48, 35, .18);
    border-radius: 8px;
    background: #fffaf3;
    box-shadow: 0 8px 22px rgba(45, 31, 22, .2);
    z-index: 10020;
}
.fbe-inline-menu.is-open {
    display: grid;
    gap: 3px;
}
.fbe-inline-menu-item {
    display: block;
    width: 100%;
    min-height: 34px;
    padding: 7px 10px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #3f2d21;
    cursor: pointer;
    font: inherit;
    font-size: 14px;
    line-height: 1.2;
    text-align: left;
    white-space: nowrap;
}
.fbe-inline-menu-item:hover,
.fbe-inline-menu-item:focus-visible {
    background: rgba(122, 87, 52, .12);
    outline: none;
}
body.dark-theme .fbe-inline-menu {
    border-color: rgba(255, 255, 255, .14);
    background: #2d2723;
    box-shadow: 0 8px 22px rgba(0, 0, 0, .42);
}
body.dark-theme .fbe-inline-menu-item {
    color: #f4ece5;
}
body.dark-theme .fbe-inline-menu-item:hover,
body.dark-theme .fbe-inline-menu-item:focus-visible {
    background: rgba(255, 255, 255, .09);
}

.fbe-warning-overlay {
    position: fixed;
    inset: 0;
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, .55);
}
.fbe-warning-dialog {
    width: min(520px, 100%);
    max-height: min(680px, calc(100vh - 40px));
    overflow: auto;
    padding: 20px;
    border: 1px solid rgba(122, 36, 36, .3);
    border-radius: 12px;
    background: #fffaf7;
    box-shadow: 0 18px 55px rgba(0, 0, 0, .35);
    color: #332822;
}
.fbe-warning-title {
    margin: 0 0 10px;
    color: #c62828;
    font-size: 20px;
    line-height: 1.25;
    font-weight: 800;
}
.fbe-warning-text {
    margin: 0 0 12px;
    color: #b71c1c;
    font-weight: 700;
    line-height: 1.45;
}
.fbe-warning-list {
    margin: 0 0 16px 20px;
    padding: 0;
    color: #b71c1c;
    font-weight: 700;
}
.fbe-warning-list li + li {
    margin-top: 4px;
}
.fbe-warning-note {
    margin: 0 0 18px;
    line-height: 1.45;
}
.fbe-warning-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
}
.fbe-warning-button {
    min-height: 38px;
    padding: 8px 14px;
    border-radius: 7px;
    border: 1px solid rgba(60, 45, 36, .25);
    background: #ffffff;
    color: #332822;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
}
.fbe-warning-button:hover,
.fbe-warning-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 134, 198, .2);
}
.fbe-warning-button-confirm {
    border-color: #a91f1f;
    background: #c62828;
    color: #ffffff;
}
.fbe-warning-button-confirm:hover,
.fbe-warning-button-confirm:focus-visible {
    background: #a91f1f;
}
body.dark-theme .fbe-warning-dialog {
    border-color: rgba(255, 105, 105, .35);
    background: #2d2723;
    color: #f4ece5;
}
body.dark-theme .fbe-warning-title,
body.dark-theme .fbe-warning-text,
body.dark-theme .fbe-warning-list {
    color: #ff7777;
}
body.dark-theme .fbe-warning-button {
    border-color: rgba(255, 255, 255, .2);
    background: #3a322d;
    color: #f4ece5;
}
body.dark-theme .fbe-warning-button-confirm {
    border-color: #d94848;
    background: #b72a2a;
    color: #ffffff;
}

@media (max-width: 767px) {
    .hat-actions-container > .d-flex.flex-wrap.justify-content-center {
        justify-content: flex-start !important;
        width: 100%;
    }
}

@media (max-width: 520px) {
    .fbe-inline-menu {
        left: auto;
        right: 0;
    }
}
`;

    document.querySelector(`#${style.id}`)?.remove();
    document.head.appendChild(style);

    const wrapper = document.createElement("div");
    wrapper.id = "ficbook-export-buttons";

    const menu = document.createElement("div");
    menu.className = "fbe-inline-menu";
    menu.id = "ficbook-export-format-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Выберите формат файла");

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "ds-btn ds-btn-regular ds-btn-mini fbe-inline-trigger";
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-controls", menu.id);
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML = `
<span class="fbe-inline-trigger-label">Скачать</span>
<span class="fbe-inline-trigger-chevron" aria-hidden="true">▼</span>`;

    const triggerLabel = trigger.querySelector(".fbe-inline-trigger-label");
    const triggerChevron = trigger.querySelector(".fbe-inline-trigger-chevron");
    let activeDownload = null;

    const configs = [
        { format: "FB2", start: exporters.fb2 },
        { format: "EPUB", start: exporters.epub },
        { format: "PDF", start: exporters.pdf },
        { format: "TXT", start: exporters.txt }
    ];

    function closeMenu() {
        menu.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
        if (activeDownload) return;
        menu.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        menu.querySelector(".fbe-inline-menu-item")?.focus();
    }

    function resetTrigger() {
        trigger.classList.remove("is-busy");
        triggerLabel.textContent = "Скачать";
        triggerChevron.textContent = "▼";
        trigger.title = "Выбрать формат файла";
    }


    function showMetadataWarning(warnings, format) {
        return new Promise(resolve => {
            const overlay = document.createElement("div");
            overlay.className = "fbe-warning-overlay";
            overlay.setAttribute("role", "presentation");

            const dialog = document.createElement("div");
            dialog.className = "fbe-warning-dialog";
            dialog.setAttribute("role", "alertdialog");
            dialog.setAttribute("aria-modal", "true");
            dialog.setAttribute("aria-labelledby", "fbe-warning-title");

            const title = document.createElement("h2");
            title.className = "fbe-warning-title";
            title.id = "fbe-warning-title";
            title.textContent = "ВНИМАНИЕ: часть данных не найдена";

            const text = document.createElement("p");
            text.className = "fbe-warning-text";
            text.textContent = "Ficbook Exporter не смог распознать некоторые данные страницы:";

            const list = document.createElement("ul");
            list.className = "fbe-warning-list";
            (warnings?.length ? warnings : ["неизвестная ошибка распознавания метаданных"]).forEach(message => {
                const item = document.createElement("li");
                item.textContent = message;
                list.appendChild(item);
            });

            const note = document.createElement("p");
            note.className = "fbe-warning-note";
            note.textContent = `Можно продолжить и скачать ${format}, но отсутствующие данные будут пропущены или заменены безопасным значением.`;

            const actions = document.createElement("div");
            actions.className = "fbe-warning-actions";

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "fbe-warning-button";
            cancelButton.textContent = "Отмена";

            const confirmButton = document.createElement("button");
            confirmButton.type = "button";
            confirmButton.className = "fbe-warning-button fbe-warning-button-confirm";
            confirmButton.textContent = "Скачать всё равно";

            actions.append(cancelButton, confirmButton);
            dialog.append(title, text, list, note, actions);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            const finish = accepted => {
                document.removeEventListener("keydown", onWarningKeyDown, true);
                overlay.remove();
                resolve(accepted);
            };

            const onWarningKeyDown = event => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    finish(false);
                }
            };

            cancelButton.addEventListener("click", () => finish(false), { once: true });
            confirmButton.addEventListener("click", () => finish(true), { once: true });
            overlay.addEventListener("click", event => {
                if (event.target === overlay) finish(false);
            });
            document.addEventListener("keydown", onWarningKeyDown, true);
            confirmButton.focus();
        });
    }

    function cancelActiveDownload() {
        if (!activeDownload || activeDownload.stopping) return;
        activeDownload.stopping = true;
        activeDownload.cancelled = true;
        triggerLabel.textContent = "Остановка…";
        triggerChevron.textContent = "";
    }

    async function runDownload(config) {
        if (activeDownload) return;
        closeMenu();

        const state = { cancelled: false, stopping: false, format: config.format };
        activeDownload = state;
        trigger.classList.add("is-busy");
        triggerLabel.textContent = `Подготовка ${config.format}`;
        triggerChevron.textContent = "×";
        trigger.title = `Остановить экспорт ${config.format}`;

        try {
            let options = {};

            while (!state.cancelled) {
                try {
                    await config.start(
                        (current, total) => {
                            if (state.cancelled) throw new Error("cancelled");
                            triggerLabel.textContent = `${config.format} ${current}/${total}`;
                        },
                        () => state.cancelled,
                        options
                    );
                    break;
                } catch (error) {
                    if (
                        error?.name === "MetadataWarningError" &&
                        !options.allowIncompleteMetadata
                    ) {
                        triggerLabel.textContent = "Нужно подтверждение";
                        triggerChevron.textContent = "!";

                        const accepted = await showMetadataWarning(
                            error.warnings,
                            config.format
                        );

                        if (!accepted || state.cancelled) break;

                        options = { allowIncompleteMetadata: true };
                        triggerLabel.textContent = `Подготовка ${config.format}`;
                        triggerChevron.textContent = "×";
                        continue;
                    }

                    throw error;
                }
            }
        } catch (error) {
            if (error?.message !== "cancelled") {
                console.error(`Ошибка экспорта ${config.format}:`, error);
                alert(`Не удалось создать файл ${config.format}:\n${error?.message || error}`);
            }
        } finally {
            if (activeDownload === state) activeDownload = null;
            resetTrigger();
        }
    }

    configs.forEach(config => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "fbe-inline-menu-item";
        item.setAttribute("role", "menuitem");
        item.textContent = `Скачать ${config.format}`;
        item.addEventListener("click", event => {
            event.stopPropagation();
            runDownload(config);
        });
        menu.appendChild(item);
    });

    trigger.addEventListener("click", event => {
        event.stopPropagation();
        if (activeDownload) {
            cancelActiveDownload();
            return;
        }
        if (menu.classList.contains("is-open")) closeMenu();
        else openMenu();
    });

    function onDocumentClick(event) {
        if (!wrapper.contains(event.target)) closeMenu();
    }

    function onKeyDown(event) {
        if (event.key === "Escape") {
            closeMenu();
            trigger.focus();
        }
    }

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKeyDown);

    wrapper.append(menu, trigger);

    /**
     * Ставит кнопку в основную строку действий вместе с лайками,
     * комментариями и наградами. Если Ficbook пересоздал панель,
     * кнопка автоматически возвращается в новый контейнер.
     */
    function insertWrapper() {
        const placement = findPlacement();
        if (!placement?.row) return false;

        const { row } = placement;
        if (wrapper.parentElement !== row) {
            row.appendChild(wrapper);
        }
        return true;
    }

    insertWrapper();
    resetTrigger();

    // Ficbook может дорисовывать или полностью пересоздавать панель действий.
    // Наблюдатель с небольшой задержкой возвращает кнопку на правильное место.
    let reinjectTimer = null;
    const placementObserver = new MutationObserver(() => {
        if (reinjectTimer !== null) return;
        reinjectTimer = window.setTimeout(() => {
            reinjectTimer = null;
            insertWrapper();
        }, 150);
    });
    placementObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    window[cleanupKey] = () => {
        document.removeEventListener("click", onDocumentClick);
        document.removeEventListener("keydown", onKeyDown);
        placementObserver.disconnect();
        if (reinjectTimer !== null) window.clearTimeout(reinjectTimer);
        wrapper.remove();
        style.remove();
        delete window[cleanupKey];
    };

    return true;
}
