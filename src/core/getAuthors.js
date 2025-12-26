export function getAuthors() {
    const hat = document.querySelector(".fanfic-hat-body");
    const authorsNodes = hat.querySelectorAll(".creator-info .creator-username");
    return Array.from(authorsNodes).map(a => ({
        name: a.innerText.trim(),
        url: a.href
    }));
}
