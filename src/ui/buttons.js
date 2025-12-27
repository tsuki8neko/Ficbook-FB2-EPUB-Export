export function createButtons(createFB2, createEPUB) {
    const container = document.createElement("div");
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

    fb2Btn.onclick = () => {
        fb2Btn.disabled = true;

        createFB2((current, total) => {
            fb2Btn.textContent = `FB2: ${current} / ${total}`;
        }).finally(() => {
            fb2Btn.textContent = "Скачать FB2";
            fb2Btn.disabled = false;
        });
    };

    epubBtn.onclick = () => {
        epubBtn.disabled = true;

        createEPUB((current, total) => {
            epubBtn.textContent = `EPUB: ${current} / ${total}`;
        }).finally(() => {
            epubBtn.textContent = "Скачать EPUB";
            epubBtn.disabled = false;
        });
    };

    container.appendChild(fb2Btn);
    container.appendChild(epubBtn);
    document.body.appendChild(container);
}

//testtesttest