function absoluteUrl(value) {
    if (!value) return "";
    const base = location.origin && location.origin !== "null" ? location.origin : "https://ficbook.net";
    try { return new URL(value, base).href; } catch (_) { return value; }
}

function cleanText(value) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeRole(value, fallback = "автор") {
    const text = cleanText(value)
        .toLowerCase()
        .replace(/[:：]+$/, "")
        .trim();

    if (!text) return fallback;
    if (/автор\s+оригинала/.test(text)) return "автор оригинала";
    if (/соавтор/.test(text)) return "соавтор";
    if (/переводчик/.test(text)) return "переводчик";
    if (/\bбета\b/.test(text)) return "бета";
    if (/\bгамма\b/.test(text)) return "гамма";
    if (/редактор/.test(text)) return "редактор";
    if (/\bавтор\b/.test(text)) return "автор";

    return fallback;
}

function roleFromContainer(node, fallback = "автор") {
    if (!node) return fallback;

    const explicitRole = node.querySelector?.(
        ".small-text.text-muted, .text-muted, [class*='role'], [class*='creator-role'], [data-role]"
    );

    const explicitText = cleanText(
        explicitRole?.getAttribute?.("data-role") ||
        explicitRole?.textContent
    );

    if (explicitText) return normalizeRole(explicitText, fallback);

    const containerText = cleanText(node.textContent);
    return normalizeRole(containerText, fallback);
}

function addUnique(result, seen, person) {
    const name = cleanText(person?.name);
    if (!name) return;

    const url = absoluteUrl(person?.url || "");
    const role = normalizeRole(person?.role || "автор");
    const key = `${url || name.toLowerCase()}|${role}`;

    if (seen.has(key)) return;
    seen.add(key);
    result.push({ name, url, role });
}

function getHeaderRoots(doc) {
    const title =
        doc.querySelector("h1.heading[itemprop='name']") ||
        doc.querySelector("h1.heading[itemprop='headline']") ||
        doc.querySelector("h1.heading") ||
        doc.querySelector("h1[itemprop='name']") ||
        doc.querySelector("h1");

    const candidates = [
        doc.querySelector(".fanfic-hat-body"),
        doc.querySelector(".fanfic-hat"),
        doc.querySelector("section.chapter-info"),
        doc.querySelector("[itemtype*='CreativeWork']"),
        title?.closest("section"),
        title?.closest("article"),
        title?.parentElement?.parentElement,
        title?.parentElement
    ].filter(Boolean);

    return [...new Set(candidates)];
}

function collectLegacyAuthors(root, result, seen) {
    root.querySelectorAll(".creator-info").forEach(container => {
        const nameNode = container.querySelector(
            ".creator-username, a[href*='/authors/'], [itemprop='author'] a, a[itemprop='author']"
        );
        if (!nameNode) return;

        addUnique(result, seen, {
            name: nameNode.textContent,
            url: nameNode.getAttribute?.("href") || "",
            role: roleFromContainer(container)
        });
    });
}

function collectSemanticAuthors(root, result, seen) {
    const selectors = [
        "[itemprop='author'] a[href*='/authors/']",
        "a[itemprop='author'][href*='/authors/']",
        "[itemprop='creator'] a[href*='/authors/']",
        "a[itemprop='creator'][href*='/authors/']"
    ].join(", ");

    root.querySelectorAll(selectors).forEach(link => {
        const container =
            link.closest(".creator-info, [class*='creator'], [class*='author'], .mb-10, li, div") ||
            link.parentElement;

        addUnique(result, seen, {
            name: link.textContent,
            url: link.getAttribute("href"),
            role: roleFromContainer(container)
        });
    });
}

function collectAuthorLinks(root, result, seen) {
    root.querySelectorAll("a[href*='/authors/']").forEach(link => {
        if (link.closest(".comments, .comment, [class*='comment'], nav, header.site-header, footer")) return;

        const container =
            link.closest(".creator-info, [class*='creator'], [class*='author'], .mb-10, li") ||
            link.parentElement;

        const role = roleFromContainer(container, "автор");

        addUnique(result, seen, {
            name: link.textContent || link.getAttribute("title") || "",
            url: link.getAttribute("href"),
            role
        });
    });
}

function collectJsonLdAuthors(doc, result, seen) {
    doc.querySelectorAll("script[type='application/ld+json']").forEach(script => {
        let data;
        try {
            data = JSON.parse(script.textContent || "null");
        } catch (_) {
            return;
        }

        const queue = Array.isArray(data) ? [...data] : [data];

        while (queue.length) {
            const item = queue.shift();
            if (!item || typeof item !== "object") continue;

            if (Array.isArray(item["@graph"])) queue.push(...item["@graph"]);

            const authors = item.author || item.creator;
            const values = Array.isArray(authors) ? authors : authors ? [authors] : [];

            values.forEach(author => {
                if (typeof author === "string") {
                    addUnique(result, seen, { name: author, role: "автор" });
                    return;
                }

                if (!author || typeof author !== "object") return;
                addUnique(result, seen, {
                    name: author.name || author.alternateName || "",
                    url: author.url || author["@id"] || "",
                    role: "автор"
                });
            });
        }
    });
}

function collectMetaAuthor(doc, result, seen) {
    const node =
        doc.querySelector("meta[name='author']") ||
        doc.querySelector("meta[property='article:author']");

    const name = cleanText(node?.getAttribute("content"));
    if (name) addUnique(result, seen, { name, role: "автор" });
}

export function getAuthors(doc = document) {
    const result = [];
    const seen = new Set();
    const roots = getHeaderRoots(doc);

    // Старый и наиболее точный вариант разметки Ficbook.
    roots.forEach(root => collectLegacyAuthors(root, result, seen));

    // Семантическая разметка, если сайт перестал использовать старые CSS-классы.
    roots.forEach(root => collectSemanticAuthors(root, result, seen));

    // Резервный вариант: профиль участника Ficbook всегда ведёт на /authors/<id>.
    roots.forEach(root => collectAuthorLinks(root, result, seen));

    // Последние резервы на случай очередной переделки шапки страницы.
    if (!result.length) collectJsonLdAuthors(doc, result, seen);
    if (!result.length) collectMetaAuthor(doc, result, seen);

    return result;
}
