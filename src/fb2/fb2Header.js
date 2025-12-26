import { escapeXml } from "../utils/escapeXml.js";
import { textToParagraphs } from "../utils/textToParagraphs.js";

export function buildFb2Header({
                                   title,
                                   mainAuthor,
                                   coauthors,
                                   direction,
                                   rating,
                                   size,
                                   status,
                                   tags,
                                   description,
                                   notes,
                                   otherPublication,
                                   fandom
                               }) {
    return `<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:xlink="http://www.w3.org/1999/xlink">
    <stylesheet type="text/css">
        .body{font-family : Verdana, Geneva, Arial, Helvetica, sans-serif;}
        .p{margin:0.5em 0 0 0.3em; padding:0.2em; text-align:justify;}
    </stylesheet>
    <description>
        <title-info>

            <author>
                <username>${escapeXml(mainAuthor.name)}</username>
                <first-name>${escapeXml(mainAuthor.name)}</first-name>
                <home-page>${escapeXml(mainAuthor.url)}</home-page>
            </author>

            <book-title>${escapeXml(title)}</book-title>

            <annotation>
                <p><strong>${escapeXml(title)}</strong> (${escapeXml(location.href)})</p>
                <p><strong>Направленность:</strong> ${escapeXml(direction)}</p>
                <p><strong>Автор:</strong> ${escapeXml(mainAuthor.name)} (${escapeXml(mainAuthor.url)})</p>
                ${coauthors ? `<p><strong>Соавторы:</strong> ${escapeXml(coauthors)}</p>` : ""}
                <p><strong>Фэндом:</strong> ${escapeXml(fandom || "")}</p>
                <p><strong>Рейтинг:</strong> ${escapeXml(rating)}</p>
                <p><strong>Размер:</strong> ${escapeXml(size)} слов</p>
                <p><strong>Статус:</strong> ${escapeXml(status)}</p>
                <p><strong>Метки:</strong> ${escapeXml(tags || "")}</p>
                <p><strong>Описание:</strong></p>
                ${textToParagraphs(description)}
                <p><strong>Примечания:</strong></p>
                ${textToParagraphs(notes)}
                <p><strong>Публикация на других ресурсах:</strong> ${escapeXml(otherPublication || "")}</p>
            </annotation>

            <date value="${new Date().toISOString().split("T")[0]}">${new Date().toLocaleDateString()}</date>
            <lang>ru</lang>

        </title-info>

        <document-info>
            <program-used>https://ficbook.net</program-used>
            <date value="${new Date().toISOString()}">${new Date().toLocaleString()}</date>
            <src-url>${escapeXml(location.href)}</src-url>
            <id>${Date.now()}</id>
        </document-info>
    </description>
`;
}
