js
export function getTitle() {
    return (
        document.querySelector("h1.heading[itemprop='name']")?.innerText.trim() ||
        document.querySelector("h1.heading[itemprop='headline']")?.innerText.trim() ||
        "Фанфик"
    );
}