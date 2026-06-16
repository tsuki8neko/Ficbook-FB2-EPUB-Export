/**
 * generateFileName.js Формирует базовое имя файла для экспорта.
 *
 * Итоговый формат:
 * author_-_title
 *
 * Используется для:
 * - FB2 файла
 * - EPUB файла
 * - архива экспортов
 */

export function sanitizeFilePart(str) {
    return str.replace(/\s+/g, "_").replace(/[\\/:*?"<>|]+/g, "");
}

export function generateFileBaseName(mainAuthorName, title) {
    return `${sanitizeFilePart(mainAuthorName)}_-_${sanitizeFilePart(title)}`;
}
