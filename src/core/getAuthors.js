function absoluteUrl(value) {
    if (!value) return "";
    const base = location.origin && location.origin !== "null" ? location.origin : "https://ficbook.net";
    try { return new URL(value, base).href; } catch (_) { return value; }
}

export function getAuthors(doc = document) {
    const hat = doc.querySelector(".fanfic-hat-body") || doc;
    const creators = hat.querySelectorAll(".creator-info");

    return Array.from(creators)
        .map(c => {
            const nameNode = c.querySelector(".creator-username");
            const roleNode = c.querySelector(".small-text.text-muted");
            const role = roleNode?.textContent?.trim().toLowerCase().replace(/[:：]+$/, "") || "автор";

            return {
                name: nameNode?.textContent?.trim() || "",
                url: absoluteUrl(nameNode?.getAttribute("href")),
                role
            };
        })
        .filter(author => author.name);
}
