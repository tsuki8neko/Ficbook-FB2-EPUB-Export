export function getTitle() {
    return document.querySelector("h1.heading[itemprop='name']")?.innerText.trim() || "Фанфик";
}
