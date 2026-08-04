import { escapeXml } from "../utils/escapeXml.js";
import { textToParagraphs } from "../utils/textToParagraphs.js";

function personXml(person) {
    if (!person) return "";
    return `
            <author>
                <nickname>${escapeXml(person.name)}</nickname>
                ${person.url ? `<home-page>${escapeXml(person.url)}</home-page>` : ""}
            </author>`;
}

function annotationPerson(label, people) {
    if (!people?.length) return "";
    const value = people.map(person => person.url
        ? `${escapeXml(person.name)} (${escapeXml(person.url)})`
        : escapeXml(person.name)
    ).join(", ");
    return `<p><strong>${escapeXml(label)}:</strong> ${value}</p>`;
}

export function buildFb2Header({ meta, cover, bookId }) {
    const {
        title, mainAuthor, coauthors, originalAuthor, originalWork, translators,
        betas, gammas, direction, rating, size, status, tags, description,
        notes, otherPublication, fandom, pairings, series, sourceUrl
    } = meta;
    const today = new Date();
    const isoDate = today.toISOString().split("T")[0];

    return `<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:xlink="http://www.w3.org/1999/xlink">
    <description>
        <title-info>
            <genre>prose_contemporary</genre>
            ${personXml(mainAuthor)}
            ${(coauthors || []).map(personXml).join("\n")}
            <book-title>${escapeXml(title)}</book-title>
            <annotation>
                <p><strong>Ссылка на работу:</strong> ${escapeXml(sourceUrl)}</p>
                ${direction ? `<p><strong>Направленность:</strong> ${escapeXml(direction)}</p>` : ""}
                ${mainAuthor ? `<p><strong>Автор:</strong> ${escapeXml(mainAuthor.name)}${mainAuthor.url ? ` (${escapeXml(mainAuthor.url)})` : ""}</p>` : ""}
                ${originalAuthor && originalAuthor.name !== mainAuthor?.name ? `<p><strong>Автор оригинала:</strong> ${escapeXml(originalAuthor.name)}${originalAuthor.url ? ` (${escapeXml(originalAuthor.url)})` : ""}</p>` : ""}
                ${originalWork?.url ? `<p><strong>Оригинал:</strong> ${escapeXml(originalWork.url)}</p>` : ""}
                ${annotationPerson("Переводчик", translators)}
                ${annotationPerson("Соавторы", coauthors)}
                ${annotationPerson("Бета", betas)}
                ${annotationPerson("Гамма", gammas)}
                ${series ? `<p><strong>Серия:</strong> ${escapeXml(series.name)}${series.url ? ` (${escapeXml(series.url)})` : ""}</p>` : ""}
                ${fandom ? `<p><strong>Фэндом:</strong> ${escapeXml(fandom)}</p>` : ""}
                ${pairings?.length ? `<p><strong>Пейринги и персонажи:</strong> ${escapeXml(pairings.join(", "))}</p>` : ""}
                ${rating ? `<p><strong>Рейтинг:</strong> ${escapeXml(rating)}</p>` : ""}
                ${size ? `<p><strong>Размер:</strong> ${escapeXml(size)} слов</p>` : ""}
                ${status ? `<p><strong>Статус:</strong> ${escapeXml(status)}</p>` : ""}
                ${tags ? `<p><strong>Метки:</strong> ${escapeXml(tags)}</p>` : ""}
                ${description ? `<p><strong>Описание:</strong></p>${textToParagraphs(description)}` : ""}
                ${notes ? `<p><strong>Примечания:</strong></p>${textToParagraphs(notes)}` : ""}
                ${otherPublication ? `<p><strong>Публикация на других ресурсах:</strong> ${escapeXml(otherPublication)}</p>` : ""}
            </annotation>
            ${tags ? `<keywords>${escapeXml(tags)}</keywords>` : ""}
            <date value="${isoDate}">${today.toLocaleDateString("ru-RU")}</date>
            ${cover ? `<coverpage><image xlink:href="#${cover.fileName}"/></coverpage>` : ""}
            <lang>ru</lang>
            ${series?.name ? `<sequence name="${escapeXml(series.name)}"/>` : ""}
        </title-info>
        <document-info>
            <author><nickname>Ficbook Exporter</nickname></author>
            <program-used>Ficbook Exporter</program-used>
            <date value="${today.toISOString()}">${today.toLocaleString("ru-RU")}</date>
            <src-url>${escapeXml(sourceUrl)}</src-url>
            <id>${escapeXml(bookId)}</id>
            <version>2.0</version>
        </document-info>
    </description>
`;
}
