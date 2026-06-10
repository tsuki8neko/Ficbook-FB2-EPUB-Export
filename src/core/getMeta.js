export function getExtraData() {
    const findBlock = (label) =>
        Array.from(document.querySelectorAll(".description .mb-10"))
            .find(n => n.querySelector("strong")?.innerText.includes(label));

    // --- ФЭНДОМ ---
    const fandomBlock = findBlock("Фэндом:");
    let fandom = fandomBlock
        ? Array.from(fandomBlock.querySelectorAll("a")).map(a => a.innerText.trim()).join(", ")
        : "";

    // // Фикс для ориджиналов — если фэндом пустой
    // if (!fandom || fandom.trim() === "") {
    //     // Ищем ссылку на ориджиналы
    //     const origLink = document.querySelector('a[href*="/fanfiction/no_fandom/originals"]');
    //     if (origLink) {
    //         fandom = origLink.innerText.trim(); // "Ориджиналы"
    //     } else {
    //         fandom = "Ориджинал"; // fallback на случай редких вариантов
    //     }
    // }

    // --- РАЗМЕР ---
    const sizeBlock = findBlock("Размер:");
    let size = "";
    if (sizeBlock) {
        const match = sizeBlock.innerText.match(/(\d[\d\s]*\d)\s*слов/);
        size = match ? match[1] : "";
    }

    // --- ТЕГИ ---
    const tagsNode = document.querySelector(".description .tags");
    const tags = tagsNode
        ? Array.from(tagsNode.querySelectorAll("a")).map(a => a.innerText.trim()).join(", ")
        : "";

    // --- ОПИСАНИЕ ---
    const description = document.querySelector(".description .js-public-beta-description")?.innerText.trim() || "";

    // --- ПРИМЕЧАНИЯ ---
    const notes = document.querySelector(".description .js-public-beta-author-comment")?.innerText.trim() || "";

    // --- ПУБЛИКАЦИЯ НА ДРУГИХ РЕСУРСАХ ---
    const otherPublicationBlock = findBlock("Публикация на других ресурсах:");
    const otherPublication = otherPublicationBlock
        ? otherPublicationBlock.innerText.trim()
        : "";

    // --- ПЕЙРИНГИ ---
    const pairingBlock =
        findBlock("Пэйринг и персонажи:") ||
        findBlock("Пейринг и персонажи:");

    const pairings = pairingBlock
        ? Array.from(pairingBlock.querySelectorAll("a"))
            .map(a => a.innerText.trim())
            .filter(Boolean)
        : [];


    return { fandom, size, tags, description, notes, otherPublication, pairings };

}

export function getDirectionRatingStatus() {

    // For old layout
    // const direction = document.querySelector(".fanfic-badges .badge-with-icon.direction .badge-text")?.innerText.trim() || "";
    // const rating = document.querySelector(".fanfic-badges .badge-with-icon[class*='badge-rating'] .badge-text")?.innerText.trim() || "";
    // const status = document.querySelector(".fanfic-badges .badge-with-icon[class*='badge-status'] .badge-text")?.innerText.trim() || "";

    const root = document.querySelector(".fanfic-badges");
    if (!root) return { direction: "НЕ НАЙДЕНО", rating: "НЕ НаЙДЕНО", status: "НЕ НАЙДЕНО" };

    // Направленность (Слэш, Джен, Гет и т.п.)
    const directionNode = root.querySelector("[class*='direction']");
    const direction =
        directionNode?.querySelector("span")?.innerText.trim() ||
        directionNode?.innerText.trim() ||
        "";

    // Рейтинг (G, PG-13, R, NC-17…)
    const ratingNode = root.querySelector("[class*='ds-label-rating']");
    const rating = ratingNode?.innerText.trim() || "";

    // Статус (В процессе, Завершён, Заморожен…)
    const statusNode = root.querySelector("[class*='ds-label-status']");
    const status = statusNode?.innerText.trim() || "";


    return { direction, rating, status };
}

export function getOriginalAuthor() {
    const blocks = document.querySelectorAll(".mb-10");

    for (const block of blocks) {
        const strong = block.querySelector("strong");
        if (!strong) continue;

        if (strong.innerText.trim().startsWith("Автор оригинала")) {
            const link = block.querySelector("a");
            return {
                name: link?.innerText.trim() || "",
                url: link?.href || ""
            };
        }
    }

    return null;
}

export function getOriginalWork() {
    const blocks = document.querySelectorAll(".mb-10");

    for (const block of blocks) {
        const strong = block.querySelector("strong");
        if (!strong) continue;

        if (strong.innerText.trim().startsWith("Оригинал")) {
            const link = block.querySelector("a");
            if (!link) return null;

            let url = link.href;

            // Если это ficbook-редирект — извлекаем оригинал
            if (url.includes("/away?url=")) {
                const real = url.split("/away?url=")[1];
                url = decodeURIComponent(real);
            }

            return { url };
        }
    }

    return null;
}

