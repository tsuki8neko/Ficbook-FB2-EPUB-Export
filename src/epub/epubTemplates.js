import { escapeXml } from "../utils/escapeXml.js";
import { textToParagraphs } from "../utils/textToParagraphs.js";

export function buildTitlePage({
                                   title,
                                   mainAuthor,
                                   coauthors,
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
                                   pairings
                               }) {
    return `
<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops"
      xml:lang="ru">
<head>
    <title>${escapeXml(title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <div class="title-page">
        <h1>${escapeXml(title)}</h1>
        <h2>${escapeXml(mainAuthor.name)}</h2>

        <div class="meta-block">
            <p><strong>Ссылка на работу:</strong> ${escapeXml(location.href)}</p>
            <p><strong>Направленность:</strong> ${escapeXml(direction)}</p>
            <p><strong>Автор:</strong> ${escapeXml(mainAuthor.name)} (${escapeXml(mainAuthor.url)})</p>

            ${translators?.length
        ? `<p><strong>Переводчик:</strong> ${
            translators.map(a => `${a.name} (${a.url})`).join(", ")
        }</p>`
        : ""
    }

            ${betas?.length
        ? `<p><strong>Бета:</strong> ${
            betas.map(a => `${a.name} (${a.url})`).join(", ")
        }</p>`
        : ""
    }

            ${gammas?.length
        ? `<p><strong>Гамма:</strong> ${
            gammas.map(a => `${a.name} (${a.url})`).join(", ")
        }</p>`
        : ""
    }

            ${coauthors?.length
        ? `<p><strong>Соавторы:</strong> ${
            coauthors.map(a => `${a.name} (${a.url})`).join(", ")
        }</p>`
        : ""
    }

            <p><strong>Фэндом:</strong> ${escapeXml(fandom)}</p>

            ${pairings?.length
        ? `<p><strong>Пейринги и персонажи:</strong> ${escapeXml(pairings.join(", "))}</p>`
        : ""
    }

            <p><strong>Рейтинг:</strong> ${escapeXml(rating)}</p>
            <p><strong>Размер:</strong> ${escapeXml(size)} слов</p>
            <p><strong>Статус:</strong> ${escapeXml(status)}</p>
            <p><strong>Метки:</strong> ${escapeXml(tags)}</p>
        </div>
    </div>

    <h2>Описание</h2>
    ${textToParagraphs(description)}

    ${notes ? `<h2>Примечания</h2>\n${textToParagraphs(notes)}` : ""}

    ${otherPublication ? `<h2>Публикация на других ресурсах</h2>\n<p>${escapeXml(otherPublication)}</p>` : ""}

</body>
</html>
`.trim();
}

export function buildChapterPage(ch) {
    return `
<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops"
      xml:lang="ru">
<head>
    <title>${escapeXml(ch.title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>${escapeXml(ch.title)}</h1>
    ${ch.content}
</body>
</html>
`.trim();
}

export function buildTocXhtml(chapters) {
    const tocItems = chapters.map(ch => `
        <li><a href="${escapeXml(ch.file)}">${escapeXml(ch.title)}</a></li>
    `).join("\n");

    return `
<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:epub="http://www.idpf.org/2007/ops"
      xml:lang="ru">
<head>
    <title>Оглавление</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>Оглавление</h1>
    <ol>
        ${tocItems}
    </ol>
</body>
</html>
`.trim();
}
