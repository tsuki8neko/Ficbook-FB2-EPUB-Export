/**
 * textToParagraphs Преобразует обычный текст в XHTML-параграфы.
 *
 * - разбивает текст по переносам строк
 * - удаляет пустые строки
 * - экранирует XML-символы
 * - оборачивает каждую строку в <p>
 *
 * Генерация тела текста.
 */

import { escapeXml } from "./escapeXml.js";

export function textToParagraphs(text) {
    return text.split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${escapeXml(line)}</p>`)
        .join("\n");
}
