export function createButtons(createFB2, createEPUB) {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "10000";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";

    function createButton(label, bgColor, onClick) {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.style.padding = "8px 12px";
        btn.style.borderRadius = "999px";
        btn.style.border = "none";
        btn.style.cursor = "pointer";
        btn.style.background = bgColor;
        btn.style.color = "#fff";
        btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
        btn.style.fontSize = "13px";
        btn.style.fontWeight = "600";
        btn.style.opacity = "0.9";
        btn.style.transition = "opacity 0.15s ease, transform 0.1s ease";

        btn.onmouseenter = () => {
            btn.style.opacity = "1";
            btn.style.transform = "translateY(-1px)";
        };
        btn.onmouseleave = () => {
            btn.style.opacity = "0.9";
            btn.style.transform = "translateY(0)";
        };

        btn.onclick = onClick;
        return btn;
    }

    const fb2Btn = createButton("Скачать FB2", "#3b82f6", () => {
        createFB2().catch(err => {
            console.error(err);
            alert("Ошибка при создании FB2 (см. консоль).");
        });
    });

    const epubBtn = createButton("Скачать EPUB", "#16a34a", () => {
        createEPUB().catch(err => {
            console.error(err);
            alert("Ошибка при создании EPUB (см. консоль).");
        });
    });

    container.appendChild(fb2Btn);
    container.appendChild(epubBtn);
    document.body.appendChild(container);
}
