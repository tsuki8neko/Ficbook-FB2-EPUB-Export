export function sanitizeFilePart(str) {
    return str.replace(/\s+/g, "_").replace(/[\\/:*?"<>|]+/g, "");
}

export function generateFileBaseName(mainAuthorName, title) {
    return `${sanitizeFilePart(mainAuthorName)}-_-${sanitizeFilePart(title)}`;
}
