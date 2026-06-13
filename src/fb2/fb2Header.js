/**
 * Формирует FB2 заголовок на основе метаданных произведения
 *
 * Сюда входят:
 * - информация об авторах (основной, соавторы, переводчики и т.д.)
 * - метаданные фанфика (фэндом, рейтинг, статус, размер)
 * - описание и примечания
 * - ссылки на оригинал и источник
 * - служебная информация FB2 (дата, id, язык)
 */

import { escapeXml } from "../utils/escapeXml.js";
import { textToParagraphs } from "../utils/textToParagraphs.js";

export function buildFb2Header({
                                   title,
                                   mainAuthor,
                                   coauthors,
                                   originalAuthor,
                                   originalWork,
                                   translators,
                                   betas,
                                   gammas,
                                   direction,
                                   rating,
                                   size,
                                   status,
                                   tags,
                                   description,
                                   notes,
                                   otherPublication,
                                   fandom,
                                   pairings,
                                   series
                               }) {
    return `<?xml version="1.0" encoding="utf-8"?>
<FictionBook 
    xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" 
    xmlns:xlink="http://www.w3.org/1999/xlink">

    <stylesheet type="text/css">
        .body{font-family : Verdana, Geneva, Arial, Helvetica, sans-serif;}
        .p{margin:0.5em 0 0 0.3em; padding:0.2em; text-align:justify;}
    </stylesheet>

    <description>
        <title-info>

            <!-- === ОСНОВНОЙ АВТОР === -->
            <author>
                <username>${escapeXml(mainAuthor.name)}</username>
                <first-name>${escapeXml(mainAuthor.name)}</first-name>
                <home-page>${escapeXml(mainAuthor.url)}</home-page>
            </author>

            <book-title>${escapeXml(title)}</book-title>

            <annotation>
                
                <!-- === ШАПКА === -->
                <p><strong>Ссылка на работу:</strong> ${escapeXml(location.href)}</p>
                <p><strong>Направленность:</strong> ${escapeXml(direction)}</p>

                ${mainAuthor
        ? `<p><strong>Автор:</strong> ${escapeXml(mainAuthor.name)} (${escapeXml(mainAuthor.url)})</p>`
        : `<p><strong>Автор:</strong> Оригинальный автор неизвестен</p>`
    }

                ${originalAuthor && mainAuthor?.name !== originalAuthor.name
        ? `<p><strong>Автор оригинала:</strong> ${escapeXml(originalAuthor.name)} (${escapeXml(originalAuthor.url)})</p>`
        : ""
    }

                ${originalWork
        ? `<p><strong>Оригинал:</strong> ${escapeXml(originalWork.url)}</p>`
        : ""
    }

                ${translators?.length
        ? `<p><strong>Переводчик:</strong> ${
            translators.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

                ${coauthors?.length
        ? `<p><strong>Соавторы:</strong> ${
            coauthors.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

                ${betas?.length
        ? `<p><strong>Бета:</strong> ${
            betas.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

                ${gammas?.length
        ? `<p><strong>Гамма:</strong> ${
            gammas.map(a => `${escapeXml(a.name)} (${escapeXml(a.url)})`).join(", ")
        }</p>`
        : ""
    }

                ${series
        ? `<p><strong>Серия:</strong> ${escapeXml(series.name)} (${escapeXml(series.url)})</p>`
        : ""
    }

                <p><strong>Фэндом:</strong> ${escapeXml(fandom || "")}</p>

                ${pairings?.length
        ? `<p><strong>Пейринг и персонажи:</strong> ${escapeXml(pairings.join(", "))}</p>`
        : ""
    }

                <p><strong>Рейтинг:</strong> ${escapeXml(rating)}</p>
                <p><strong>Размер:</strong> ${escapeXml(size)} слов</p>
                <p><strong>Статус:</strong> ${escapeXml(status)}</p>
                <p><strong>Метки:</strong> ${escapeXml(tags || "")}</p>

                <p></p>

                <!-- === ПРИМЕЧАНИЯ АВТОРА === -->
                <p><strong>Описание:</strong></p>
                ${textToParagraphs(description)}

                <p></p>

                <!-- === ПРИМЕЧАНИЯ АВТОРА === -->
                <p><strong>Примечания:</strong></p>
                ${textToParagraphs(notes)}

                <p><strong>Публикация на других ресурсах:</strong> ${escapeXml(otherPublication || "")}</p>

            </annotation>
            
            <!-- === FB2 СЛУЖЕБНЫЕ ДАННЫЕ === -->
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
