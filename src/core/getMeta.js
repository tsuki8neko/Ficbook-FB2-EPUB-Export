function absoluteUrl(value) {
    if (!value) return "";
    const base = location.origin && location.origin !== "null" ? location.origin : "https://ficbook.net";
    try { return new URL(value, base).href; } catch (_) { return value; }
}

export function getExtraData(doc = document) {
    const findBlock = (label) =>
        Array.from(doc.querySelectorAll(".description .mb-10, .fanfic-hat-body .mb-10"))
            .find(node => node.querySelector("strong")?.textContent?.includes(label));

    const fandomBlock = findBlock("Фэндом:");
    const fandom = fandomBlock
        ? Array.from(fandomBlock.querySelectorAll("a"))
            .map(a => a.textContent.trim())
            .filter(Boolean)
            .join(", ")
        : "";

    const sizeBlock = findBlock("Размер:");
    const sizeText = sizeBlock?.textContent || "";
    const sizeMatch = sizeText.match(/(\d[\d\s]*\d|\d)\s*слов/i);
    const size = sizeMatch ? sizeMatch[1].replace(/\s+/g, " ") : "";

    const tagsNode = doc.querySelector(".description .tags, .fanfic-hat-body .tags");
    const tags = tagsNode
        ? Array.from(tagsNode.querySelectorAll("a"))
            .map(a => a.textContent.trim())
            .filter(Boolean)
            .join(", ")
        : "";

    const description = doc.querySelector(
        ".description .js-public-beta-description, .fanfic-hat-body .js-public-beta-description"
    )?.textContent?.trim() || "";

    const notes = doc.querySelector(
        ".description .js-public-beta-author-comment, .fanfic-hat-body .js-public-beta-author-comment"
    )?.textContent?.trim() || "";

    const otherPublicationBlock = findBlock("Публикация на других ресурсах:");
    let otherPublication = "";
    if (otherPublicationBlock) {
        const clone = otherPublicationBlock.cloneNode(true);
        clone.querySelector("strong")?.remove();
        otherPublication = (clone.textContent || "")
            .replace(/^\s*[:：]?\s*/, "")
            .trim();
    }

    const pairingBlock = findBlock("Пэйринг и персонажи:") || findBlock("Пейринг и персонажи:");
    const pairings = pairingBlock
        ? Array.from(pairingBlock.querySelectorAll("a"))
            .map(a => a.textContent.trim())
            .filter(Boolean)
        : [];

    return { fandom, size, tags, description, notes, otherPublication, pairings };
}

export function getDirectionRatingStatus(doc = document) {
    const root = doc.querySelector(".fanfic-badges");
    if (!root) return { direction: "", rating: "", status: "" };

    const directionNode = root.querySelector("[class*='direction']");
    const direction = directionNode?.querySelector("span")?.textContent?.trim()
        || directionNode?.textContent?.trim()
        || "";

    const ratingNode = root.querySelector("[class*='ds-label-rating'], [class*='badge-rating']");
    const rating = ratingNode?.textContent?.trim() || "";

    const statusNode = root.querySelector("[class*='ds-label-status'], [class*='badge-status']");
    const status = statusNode?.textContent?.trim() || "";

    return { direction, rating, status };
}

export function getOriginalAuthor(doc = document) {
    for (const block of doc.querySelectorAll(".mb-10")) {
        const label = block.querySelector("strong")?.textContent?.trim() || "";
        if (!label.startsWith("Автор оригинала")) continue;

        const link = block.querySelector("a");
        return {
            name: link?.textContent?.trim() || "",
            url: absoluteUrl(link?.getAttribute("href"))
        };
    }
    return null;
}

export function getOriginalWork(doc = document) {
    for (const block of doc.querySelectorAll(".mb-10")) {
        const label = block.querySelector("strong")?.textContent?.trim() || "";
        if (!label.startsWith("Оригинал")) continue;

        const link = block.querySelector("a");
        if (!link) return null;

        let url = link.href || link.getAttribute("href") || "";
        try {
            const parsed = new URL(url, location.origin && location.origin !== "null" ? location.origin : "https://ficbook.net");
            if (parsed.pathname.includes("/away") && parsed.searchParams.has("url")) {
                url = parsed.searchParams.get("url");
            } else {
                url = parsed.href;
            }
        } catch (_) {
            // Оставляем исходную строку, если URL некорректен.
        }
        return { url };
    }
    return null;
}
