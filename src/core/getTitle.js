export function getTitle(doc = document) {
    const node =
        doc.querySelector("h1.heading[itemprop='name']") ||
        doc.querySelector("h1.heading[itemprop='headline']") ||
        doc.querySelector("h1.heading") ||
        doc.querySelector("h1[itemprop='name']");

    return node?.textContent?.trim() || "Фанфик";
}
