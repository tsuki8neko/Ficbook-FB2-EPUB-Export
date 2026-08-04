import { escapeXml } from "../utils/escapeXml.js";
import { textToParagraphs } from "../utils/textToParagraphs.js";

function peopleLine(label, people) {
    if (!people?.length) return "";

    const value = people
        .map(person =>
            person.url
                ? `${escapeXml(person.name)} (${escapeXml(person.url)})`
                : escapeXml(person.name)
        )
        .join(", ");

    return `<p><strong>${escapeXml(label)}:</strong> ${value}</p>`;
}

export function buildTitlePage({ meta, cover }) {
    const {
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
        pairings,
        series,
        sourceUrl
    } = meta;

    const xhtml = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ru">
<head>
    <title>${escapeXml(title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <div class="title-page">
        ${cover ? `<img class="cover" src="images/${cover.fileName}" alt="Обложка"/>` : ""}
        <h1>${escapeXml(title)}</h1>
        <h2>${escapeXml(mainAuthor?.name || "")}</h2>
        <div class="meta-block">
            <p><strong>Ссылка на работу:</strong> ${escapeXml(sourceUrl)}</p>
            ${direction ? `<p><strong>Направленность:</strong> ${escapeXml(direction)}</p>` : ""}
            ${peopleLine("Переводчик", translators)}
            ${peopleLine("Соавторы", coauthors)}
            ${peopleLine("Бета", betas)}
            ${peopleLine("Гамма", gammas)}
            ${series ? `<p><strong>Серия:</strong> ${escapeXml(series.name)}${series.url ? ` (${escapeXml(series.url)})` : ""}</p>` : ""}
            ${fandom ? `<p><strong>Фэндом:</strong> ${escapeXml(fandom)}</p>` : ""}
            ${pairings?.length ? `<p><strong>Пейринги и персонажи:</strong> ${escapeXml(pairings.join(", "))}</p>` : ""}
            ${rating ? `<p><strong>Рейтинг:</strong> ${escapeXml(rating)}</p>` : ""}
            ${size ? `<p><strong>Размер:</strong> ${escapeXml(size)} слов</p>` : ""}
            ${status ? `<p><strong>Статус:</strong> ${escapeXml(status)}</p>` : ""}
            ${tags ? `<p><strong>Метки:</strong> ${escapeXml(tags)}</p>` : ""}
        </div>
    </div>
    ${description ? `<h2>Описание</h2>${textToParagraphs(description)}` : ""}
    ${notes ? `<h2>Примечания</h2>${textToParagraphs(notes)}` : ""}
    ${otherPublication ? `<h2>Публикация на других ресурсах</h2><p>${escapeXml(otherPublication)}</p>` : ""}
</body>
</html>`;

    return xhtml.replace(/^[ \t]*\r?\n/gm, "");
}

export function buildChapterPage(chapter) {
    return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ru">
<head>
    <title>${escapeXml(chapter.title)}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>${escapeXml(`${chapter.number}. ${chapter.title}`)}</h1>
    ${chapter.content}
</body>
</html>`;
}

export function buildTocXhtml(chapters) {
    const items = chapters
        .map(chapter =>
            `<li><a href="${escapeXml(chapter.file)}">${escapeXml(`${chapter.number}. ${chapter.title}`)}</a></li>`
        )
        .join("\n");

    return `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ru">
<head>
    <title>Оглавление</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>Оглавление</h1>
    <ol>${items}</ol>
</body>
</html>`;
}