import { getTitle } from "../core/getTitle.js";
import { getAuthors } from "../core/getAuthors.js";
import { getExtraData, getDirectionRatingStatus } from "../core/getMeta.js";
import { getChapter } from "../core/getChapter.js";
import { delay } from "../utils/delay.js";
import { generateFileBaseName } from "../utils/generateFileName.js";

import { buildFb2Header } from "./fb2Header.js";
import { buildFb2Toc } from "./fb2Toc.js";
import { buildFb2Body } from "./fb2Body.js";
import { getOriginalAuthor, getOriginalWork } from "../core/getMeta.js";


// 🔥 FB2: преобразование <footnote-ref/> в FB2-сноски со сквозной нумерацией
function renderFb2Footnotes(xhtml, footnotes, globalIndexRef) {
    if (!footnotes || !footnotes.length) {
        return { content: xhtml, notes: [] };
    }

    let content = xhtml;
    let notes = [];

    footnotes.forEach(n => {
        const globalNumber = globalIndexRef.value++;

        // заменяем ссылку в тексте
        const re = new RegExp(
            `<footnote-ref[^>]*id=["']${n.id}["'][^>]*\\/?>`,
            "g"
        );

        content = content.replace(
            re,
            `<a l:href="#note_${n.id}" type="note">[${globalNumber}]</a>`
        );

        // сохраняем глобальную сноску
        notes.push({
            id: n.id,
            number: globalNumber,
            html: n.html
        });
    });

    return { content, notes };
}



export async function createFB2(onProgress = () => {}, isCancelled = () => false) {
    const title = getTitle();
    const authors = getAuthors();
    if (!authors.length) {
        alert("Авторы не найдены, возможно, изменился HTML Ficbook.");
        return;
    }

    const originalAuthor = getOriginalAuthor();
    const originalWork = getOriginalWork();

    const translators = authors.filter(a => a.role === "переводчик");

    const mainAuthor =
        authors.find(a => a.role === "автор") ||
        originalAuthor ||
        null;

    const betas = authors.filter(a => a.role === "бета");
    const gammas = authors.filter(a => a.role === "гамма");
    const coauthors = authors.filter(a => a.role === "соавтор");

    const { fandom, size, tags, description, notes, otherPublication, pairings } = getExtraData();
    const { direction, rating, status } = getDirectionRatingStatus();

    let fb2Header = buildFb2Header({
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
        pairings
    });

    let fb2Chapters = "";
    let tocEntries = [];
    let chapterIndex = 1;

    // 🔥 Глобальный счётчик сносок
    let globalFootnoteIndex = { value: 1 };

    // 🔥 Все сноски всех глав
    let allNotes = [];

    let rawChapters = Array.from(document.querySelectorAll(".list-of-fanfic-parts .part-link"))
        .filter(ch => {
            if (!ch.href) return false;
            if (ch.href.includes("/all-parts")) return false;
            let clean = ch.href.split("#")[0];
            let last = clean.split("/").pop();
            return /^\d+$/.test(last);
        });

    if (rawChapters.length === 0) {
        rawChapters = [{ href: location.href }];
    }

    let chapters = [];
    let seen = new Set();
    for (let ch of rawChapters) {
        if (!seen.has(ch.href)) {
            seen.add(ch.href);
            chapters.push(ch);
        }
    }

    const total = chapters.length;
    let failedChapters = [];

    // ---------------------------
    //   ПЕРВЫЙ ПРОХОД
    // ---------------------------
    for (let chapter of chapters) {

        if (isCancelled()) throw new Error("cancelled");

        onProgress(chapterIndex, total);

        await delay(800 + Math.random() * 700);

        try {
            let { title: chTitle, xhtml, footnotes } = await getChapter(chapter.href);

            // 🔥 FB2-сноски со сквозной нумерацией
            const { content, notes } = renderFb2Footnotes(xhtml, footnotes, globalFootnoteIndex);
            allNotes.push(...notes);

            tocEntries.push({
                id: `ch${chapterIndex}`,
                title: `•\u2003${chTitle}`
            });

            fb2Chapters += `
<section id="ch${chapterIndex}">
    <title><p>•\u2003${chTitle}</p></title>
    ${content}
</section>`;

        } catch (err) {
            console.warn("Не удалось загрузить главу:", chapter.href, err);
            failedChapters.push({ chapter, index: chapterIndex });
        }

        chapterIndex++;
    }

    // ---------------------------
    //   ВТОРОЙ ПРОХОД
    // ---------------------------
    if (failedChapters.length > 0) {
        console.warn("Повторная загрузка неудачных глав:", failedChapters.length);

        for (let item of failedChapters) {
            const { chapter, index } = item;

            await delay(1500 + Math.random() * 1000);

            try {
                let { title: chTitle, xhtml, footnotes } = await getChapter(chapter.href);

                const { content, notes } = renderFb2Footnotes(xhtml, footnotes, globalFootnoteIndex);
                allNotes.push(...notes);

                tocEntries[index - 1] = {
                    id: `ch${index}`,
                    title: `•\u2003${chTitle}`
                };

                fb2Chapters += `
<section id="ch${index}">
    <title><p>•\u2003${chTitle}</p></title>
    ${content}
</section>`;

                item.success = true;

            } catch (err) {
                console.warn("Повторно не удалось загрузить:", chapter.href);
                item.success = false;
            }
        }

        failedChapters = failedChapters.filter(ch => !ch.success);
    }

    if (failedChapters.length > 0) {
        alert(
            "Некоторые главы не удалось загрузить:\n" +
            failedChapters.map(f => f.chapter.href).join("\n")
        );
    }

    // ---------------------------
    //   Сборка FB2
    // ---------------------------
    let fb2Toc = buildFb2Toc(tocEntries);

    // Основное тело
    let fb2Body = buildFb2Body(fb2Chapters);

    // 🔥 Добавляем <body name="notes"> со сквозной нумерацией
    let fb2NotesBody = "";

    if (allNotes.length) {
        fb2NotesBody = `
<body name="notes">
${allNotes
            .map(n => `
<section id="note_${n.id}">
    <title>${n.number}</title>
    <p>${n.html}</p>
</section>
`)
            .join("\n")}
</body>
`;
    }

    // Итоговый FB2
    const fullFb2 = fb2Header + fb2Toc + fb2Body + fb2NotesBody + "</FictionBook>";

    const safeAuthorName = mainAuthor?.name || "UnknownAuthor";
    const translatorName = translators[0]?.name || null;

    let titlePart = title;
    if (translatorName) {
        titlePart += `_[${translatorName}]`;
    }

    const baseName = generateFileBaseName(safeAuthorName, titlePart);
    const fileName = `${baseName}.fb2`;

    let blob = new Blob([fullFb2], { type: "text/xml" });

    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}
