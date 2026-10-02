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

function normalizeForRole(value) {
    return cleanText(value)
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^a-zа-я0-9]+/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

const ROLE_ALIASES = [
    { role: "автор оригинала", aliases: ["автор оригинала"] },
    { role: "сопереводчик", aliases: ["сопереводчик", "со переводчик", "со переводчица"] },
    { role: "соавтор", aliases: ["соавтор", "со автор", "соавторка", "со авторка"] },
    { role: "переводчик", aliases: ["переводчик", "переводчица"] },
    { role: "бета", aliases: ["бета", "бета ридер", "бетаридер", "бета редактор"] },
    { role: "гамма", aliases: ["гамма", "гамма ридер", "гаммаридер"] },
    { role: "редактор", aliases: ["редактор", "редакторка"] },
    { role: "автор", aliases: ["автор", "авторка"] }
];

function containsRolePhrase(text, phrase) {
    const normalizedText = ` ${normalizeForRole(text)} `;
    const normalizedPhrase = ` ${normalizeForRole(phrase)} `;
    return normalizedPhrase.trim() && normalizedText.includes(normalizedPhrase);
}

function normalizeRole(value, fallback = "") {
    const text = normalizeForRole(value);
    if (!text) return fallback;

    for (const definition of ROLE_ALIASES) {
        if (definition.aliases.some(alias => containsRolePhrase(text, alias))) {
            return definition.role;
        }
    }

    return fallback;
}

function textWithoutPerson(container, personNode) {
    if (!container) return "";

    const full = cleanText(container.textContent);
    const person = cleanText(personNode?.textContent);
    if (!person) return full;

    const index = full.toLowerCase().indexOf(person.toLowerCase());
    if (index < 0) return full;

    return cleanText(`${full.slice(0, index)} ${full.slice(index + person.length)}`);
}

function explicitRoleTexts(container) {
    if (!container?.querySelectorAll) return [];

    const result = [];
    const selectors = [
        "[data-role]",
        "[data-creator-role]",
        "[class*='role']",
        "[class*='creator-role']",
        ".small-text.text-muted",
        ".small-text",
        ".text-muted",
        "small"
    ].join(", ");

    container.querySelectorAll(selectors).forEach(node => {
        const values = [
            node.getAttribute?.("data-role"),
            node.getAttribute?.("data-creator-role"),
            node.getAttribute?.("aria-label"),
            node.getAttribute?.("title"),
            node.textContent
        ];

        values.forEach(value => {
            const text = cleanText(value);
            if (text) result.push(text);
        });
    });

    return result;
}

function nearestRole(link, root) {
    const directValues = [
        link.getAttribute?.("data-role"),
        link.getAttribute?.("data-creator-role"),
        link.getAttribute?.("aria-label"),
        link.getAttribute?.("title")
    ];

    for (const value of directValues) {
        const role = normalizeRole(value);
        if (role) return { role, raw: cleanText(value), source: "link-attribute" };
    }

    const immediateNodes = [
        link.previousElementSibling,
        link.nextElementSibling,
        link.parentElement?.previousElementSibling,
        link.parentElement?.nextElementSibling
    ].filter(Boolean);

    for (const node of immediateNodes) {
        const value = cleanText(node.textContent);
        const role = normalizeRole(value);
        if (role) return { role, raw: value, source: "sibling" };
    }

    let current = link.parentElement;
    let depth = 0;

    while (current && depth < 6) {
        const profileLinks = current.querySelectorAll?.("a[href*='/authors/']") || [];

        // Не читаем общий текст контейнера, в котором уже несколько участников:
        // иначе роль первого человека может ошибочно присвоиться всем остальным.
        if (profileLinks.length <= 1) {
            for (const value of explicitRoleTexts(current)) {
                const role = normalizeRole(value);
                if (role) return { role, raw: value, source: "explicit-node" };
            }

            const value = textWithoutPerson(current, link);
            const role = normalizeRole(value);
            if (role) return { role, raw: value, source: "container-text" };
        }

        if (current === root) break;
        current = current.parentElement;
        depth += 1;
    }

    if (
        link.matches?.("[itemprop='author'], [itemprop='creator']") ||
        link.closest?.("[itemprop='author'], [itemprop='creator']")
    ) {
        return { role: "автор", raw: "itemprop=author/creator", source: "semantic" };
    }

    return { role: "неизвестно", raw: "", source: "unknown" };
}

function identityOf(person) {
    const url = absoluteUrl(person?.url || "")
        .replace(/[?#].*$/, "")
        .replace(/\/$/, "")
        .toLowerCase();
    const name = cleanText(person?.name).toLowerCase();
    return url || name;
}

function addUnique(result, person) {
    const name = cleanText(person?.name);
    if (!name) return;

    const normalized = {
        name,
        url: absoluteUrl(person?.url || ""),
        role: normalizeRole(person?.role) || person?.role || "неизвестно",
        roleRaw: cleanText(person?.roleRaw || ""),
        roleSource: person?.roleSource || "",
        roleUnknown: !person?.role || person?.role === "неизвестно"
    };

    const identity = identityOf(normalized);
    if (!identity) return;

    const samePersonIndexes = result
        .map((item, index) => identityOf(item) === identity ? index : -1)
        .filter(index => index >= 0);

    const exact = samePersonIndexes.find(index => result[index].role === normalized.role);
    if (exact !== undefined) return;

    if (normalized.role === "неизвестно" && samePersonIndexes.length) return;

    const unknownIndex = samePersonIndexes.find(index => result[index].role === "неизвестно");
    if (unknownIndex !== undefined && normalized.role !== "неизвестно") {
        result.splice(unknownIndex, 1, normalized);
        return;
    }

    result.push(normalized);
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

function isExcludedProfileLink(link) {
    if (!link) return true;

    // Ссылки на пользователей встречаются не только в блоке участников произведения.
    // В частности, Ficbook показывает профили людей, которые наградили работу,
    // внутри #rewards/.fanfic-reward-container. Такие ссылки нельзя считать
    // авторами/бетами/гаммами и тем более показывать как "неизвестную роль".
    if (link.matches?.(".reward-giver-name")) return true;

    return !!link.closest?.(
        "#rewards, .fanfic-reward-container, .rewards-modal, " +
        ".comments, .comment, [class*='comment'], nav, footer, " +
        "[class*='recommend'], [class*='review'], [class*='feed']"
    );
}

function collectLegacyCreators(root, result, processedLinks) {
    root.querySelectorAll(".creator-info").forEach(container => {
        const nameNode = container.querySelector(
            ".creator-username, a[href*='/authors/'], [itemprop='author'] a, " +
            "a[itemprop='author'], [itemprop='creator'] a, a[itemprop='creator']"
        );
        if (!nameNode) return;

        if (nameNode.matches?.("a[href*='/authors/']")) processedLinks.add(nameNode);

        const roleCandidates = explicitRoleTexts(container);
        let roleInfo = null;

        for (const value of roleCandidates) {
            const role = normalizeRole(value);
            if (role) {
                roleInfo = { role, raw: value, source: "legacy-explicit" };
                break;
            }
        }

        if (!roleInfo) {
            const value = textWithoutPerson(container, nameNode);
            const role = normalizeRole(value);
            roleInfo = role
                ? { role, raw: value, source: "legacy-container" }
                : { role: "неизвестно", raw: value, source: "legacy-unknown" };
        }

        addUnique(result, {
            name: nameNode.textContent || nameNode.getAttribute?.("title") || "",
            url: nameNode.getAttribute?.("href") || "",
            role: roleInfo.role,
            roleRaw: roleInfo.raw,
            roleSource: roleInfo.source
        });
    });
}

function collectProfileLinks(root, result, processedLinks) {
    root.querySelectorAll("a[href*='/authors/']").forEach(link => {
        if (processedLinks.has(link) || isExcludedProfileLink(link)) return;
        processedLinks.add(link);

        const roleInfo = nearestRole(link, root);
        addUnique(result, {
            name: link.textContent || link.getAttribute("title") || link.getAttribute("aria-label") || "",
            url: link.getAttribute("href"),
            role: roleInfo.role,
            roleRaw: roleInfo.raw,
            roleSource: roleInfo.source
        });
    });
}

function collectJsonLdAuthors(doc, result) {
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
                    addUnique(result, { name: author, role: "автор", roleSource: "json-ld" });
                    return;
                }

                if (!author || typeof author !== "object") return;
                addUnique(result, {
                    name: author.name || author.alternateName || "",
                    url: author.url || author["@id"] || "",
                    role: "автор",
                    roleSource: "json-ld"
                });
            });
        }
    });
}

function collectMetaAuthor(doc, result) {
    const node =
        doc.querySelector("meta[name='author']") ||
        doc.querySelector("meta[property='article:author']");

    const name = cleanText(node?.getAttribute("content"));
    if (name) addUnique(result, { name, role: "автор", roleSource: "meta" });
}

export function getAuthors(doc = document) {
    const result = [];
    const processedLinks = new WeakSet();
    const roots = getHeaderRoots(doc);

    // Сначала используем старую структуру Ficbook, если она ещё присутствует.
    roots.forEach(root => collectLegacyCreators(root, result, processedLinks));

    // Затем собираем все профильные ссылки участников и определяем роль по ближайшему
    // тексту/атрибутам. Это переживает смену CSS-классов имени и карточки участника.
    roots.forEach(root => collectProfileLinks(root, result, processedLinks));

    // Если визуальный блок участников полностью не распознан, используем семантические резервы.
    if (!result.length) collectJsonLdAuthors(doc, result);
    if (!result.length) collectMetaAuthor(doc, result);

    const unknown = result.filter(person => person.role === "неизвестно");
    if (unknown.length) {
        console.warn(
            "[Ficbook Exporter] Найдены участники с нераспознанной ролью:",
            unknown.map(person => ({ name: person.name, url: person.url, roleRaw: person.roleRaw }))
        );
    }

    return result;
}
