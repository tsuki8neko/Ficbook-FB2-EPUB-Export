/**
 * Извлекает список авторов и соавторов произведения.
 *
 * Роли бывают разными:
 * - автор
 * - бета
 * - гамма
 * - переводчик
 * - редактор
 *
 * Функция собирает все такие блоки и возвращает массив объектов.
 */

export function getAuthors() {
    // Основной блок с информацией о фанфике ("шапка")
    const hat = document.querySelector(".fanfic-hat-body");
    // Внутри шапки находятся элементы .creator-info — каждый отвечает за одного участника
    const creators = hat.querySelectorAll(".creator-info");

    return Array.from(creators).map(c => {
        const nameNode = c.querySelector(".creator-username");
        // Узел с ролью (например: "Автор", "Бета", "Переводчик")
        const roleNode = c.querySelector(".small-text.text-muted");

        return {
            name: nameNode?.innerText.trim() || "",
            url: nameNode?.href || "",
            // Роль автора, приводим к нижнему регистру для единообразия
            role: roleNode?.innerText.trim().toLowerCase() || "автор"
        };
    });
}

