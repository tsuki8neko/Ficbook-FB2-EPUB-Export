// export function getAuthors() {
//     const hat = document.querySelector(".fanfic-hat-body");
//     const authorsNodes = hat.querySelectorAll(".creator-info .creator-username");
//     return Array.from(authorsNodes).map(a => ({
//         name: a.innerText.trim(),
//         url: a.href
//     }));
// }

export function getAuthors() {
    const hat = document.querySelector(".fanfic-hat-body");
    const creators = hat.querySelectorAll(".creator-info");

    return Array.from(creators).map(c => {
        const nameNode = c.querySelector(".creator-username");
        const roleNode = c.querySelector(".small-text.text-muted");

        return {
            name: nameNode?.innerText.trim() || "",
            url: nameNode?.href || "",
            role: roleNode?.innerText.trim().toLowerCase() || "автор"
        };
    });
}

