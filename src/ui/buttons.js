export function createButtons(createFB2, createEPUB) {
    let isCancelled = false;

    const container = document.createElement("div");
    container.id = "ficbook-export-buttons";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "10000";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";

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

    // Кнопка остановки
    stopBtn.onclick = () => {
        isCancelled = true;
        stopBtn.textContent = "Остановка...";
    };

    // FB2
    fb2Btn.onclick = () => {
        isCancelled = false;
        stopBtn.textContent = "Остановить загрузку";
        stopBtn.style.display = "block";
        fb2Btn.disabled = true;

        createFB2(
            (current, total) => {
                if (isCancelled) throw new Error("cancelled");
                fb2Btn.textContent = `FB2: Загружается глава ${current}/${total}`;
            },
            () => isCancelled
        )
            .catch(err => {
                if (err.message === "cancelled") {
                    fb2Btn.textContent = "Отменено";
                }
            })
            .finally(() => {
                fb2Btn.disabled = false;
                fb2Btn.textContent = "Скачать FB2";
                stopBtn.textContent = "Остановить загрузку";
                stopBtn.style.display = "none";
            });
    };

    // EPUB
    epubBtn.onclick = () => {
        isCancelled = false;
        stopBtn.textContent = "Остановить загрузку";
        stopBtn.style.display = "block";
        epubBtn.disabled = true;

        createEPUB(
            (current, total) => {
                if (isCancelled) throw new Error("cancelled");
                epubBtn.textContent = `EPUB: Загружается глава ${current}/${total}`;
            },
            () => isCancelled
        )
            .catch(err => {
                if (err.message === "cancelled") {
                    epubBtn.textContent = "Отменено";
                }
            })
            .finally(() => {
                epubBtn.disabled = false;
                epubBtn.textContent = "Скачать EPUB";
                stopBtn.textContent = "Остановить загрузку";
                stopBtn.style.display = "none";
            });
    };

    container.appendChild(fb2Btn);
    container.appendChild(epubBtn);
    container.appendChild(stopBtn);
    document.body.appendChild(container);
}