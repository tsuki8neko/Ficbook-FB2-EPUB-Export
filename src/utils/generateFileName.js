/** Подготавливает безопасную часть имени файла для Windows/macOS/Linux.
    * Итоговый формат:
    * author_-_title
 */
export function sanitizeFilePart(value, fallback = "Без_названия") {
    let result = String(value || "")
        .normalize("NFC")
        .replace(/[\u0000-\u001F\u007F]/g, "")
        .replace(/[\\/:*?"<>|]+/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/[ ._]+$/g, "")
        .replace(/^[ ._]+/g, "")
        .slice(0, 110);

    if (!result) result = fallback;
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(result)) result = `_${result}`;
    return result;
}

export function generateFileBaseName(mainAuthorName, title) {
    return `${sanitizeFilePart(mainAuthorName, "UnknownAuthor")}_-_${sanitizeFilePart(title)}`;
}
