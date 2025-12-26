export function sanitizeFilePart(str) {
    return str.replace(/\s+/g, "_").replace(/[\\/:*?"<>|]+/g, "");
}
