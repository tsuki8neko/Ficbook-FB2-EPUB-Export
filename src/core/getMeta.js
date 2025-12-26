export function getExtraData() {
    const findBlock = (label) =>
        Array.from(document.querySelectorAll(".description .mb-10"))
            .find(n => n.querySelector("strong")?.innerText.includes(label));

    const fandomBlock = findBlock("Фэндом:");
    const fandom = fandomBlock
        ? Array.from(fandomBlock.querySelectorAll("a")).map(a => a.innerText.trim()).join(", ")
        : "";

    const sizeBlock = findBlock("Размер:");
    let size = "";
    if (sizeBlock) {
        const match = sizeBlock.innerText.match(/(\d[\d\s]*\d)\s*слов/);
        size = match ? match[1] : "";
    }

    const tagsNode = document.querySelector(".description .tags");
    const tags = tagsNode
        ? Array.from(tagsNode.querySelectorAll("a")).map(a => a.innerText.trim()).join(", ")
        : "";

    const description = document.querySelector(".description .js-public-beta-description")?.innerText.trim() || "";
    const notes = document.querySelector(".description .js-public-beta-author-comment")?.innerText.trim() || "";

    const otherPublicationBlock = findBlock("Публикация на других ресурсах:");
    const otherPublication = otherPublicationBlock
        ? otherPublicationBlock.innerText.trim()
        : "";

    return { fandom, size, tags, description, notes, otherPublication };
}

export function getDirectionRatingStatus() {
    const direction = document.querySelector(".fanfic-badges .badge-with-icon.direction .badge-text")?.innerText.trim() || "";
    const rating = document.querySelector(".fanfic-badges .badge-with-icon[class*='badge-rating'] .badge-text")?.innerText.trim() || "";
    const status = document.querySelector(".fanfic-badges .badge-with-icon[class*='badge-status'] .badge-text")?.innerText.trim() || "";
    return { direction, rating, status };
}
