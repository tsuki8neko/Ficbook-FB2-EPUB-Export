/**
 * Экранирует специальные символы XML.
 *
 * Нужно для безопасной вставки текста в:
 * - FB2
 * - EPUB
 * - XHTML
 *
 * Иначе документ может стать невалидным XML.
 */

export function escapeXml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
