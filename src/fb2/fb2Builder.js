import { getTitle } from "../core/getTitle.js";
import { getAuthors } from "../core/getAuthors.js";
import { getExtraData, getDirectionRatingStatus } from "../core/getMeta.js";
import { getChapter } from "../core/getChapter.js";
import { delay } from "../utils/delay.js";
import { generateFileBaseName } from "../utils/generateFileName.js";

import { buildFb2Header } from "./fb2Header.js";
import { buildFb2Toc } from "./fb2Toc.js";
import { buildFb2Body } from "./fb2Body.js";

/**
 * createFB2(onProgress, isCancelled)
 *
 * onProgress(current, total) — вызывается перед загрузкой каждой главы
 * isCancelled() — функция, возвращающая true, если пользователь нажал "Остановить"
 */
export async function createFB2(onProgress = () => {}, isCancelled = () => false) {
    const title = getTitle();
    const authors = getAuthors();
    if (!authors.length) {
        alert("Авторы не найдены, возможно, изменился HTML Ficbook.");
        return;
    }
    const mainAuthor = authors[0];
    const coauthors = authors.slice(1).map(a => a.name).join(", ");

    const { fandom, size, tags, description, notes, otherPublication } = getExtraData();
    const { direction, rating, status } = getDirectionRatingStatus();

    // ---------- HEADER ----------
    let fb2Header = buildFb2Header({
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
    });

    // ---------- СБОР ГЛАВ ----------
    let fb2Chapters = "";
    let tocEntries = [];
    let chapterIndex = 1;

    let rawChapters = Array.from(document.querySelectorAll(".list-of-fanfic-parts .part-link"))
        .filter(ch => {
            if (!ch.href) return false;
            if (ch.href.includes("/all-parts")) return false;
            let clean = ch.href.split("#")[0];
            let last = clean.split("/").pop();
            return /^\d+$/.test(last);
        });

    let chapters = [];
    let seen = new Set();
    for (let ch of rawChapters) {
        if (!seen.has(ch.href)) {
            seen.add(ch.href);
            chapters.push(ch);
        }
    }

    const total = chapters.length;

    for (let chapter of chapters) {

        // Проверяем отмену ДО загрузки главы
        if (isCancelled()) {
            throw new Error("cancelled");
        }

        // Сообщаем прогресс
        onProgress(chapterIndex, total);

        // Проверяем отмену ещё раз (вдруг пользователь нажал в этот момент)
        if (isCancelled()) {
            throw new Error("cancelled");
        }

        // Задержка между запросами
        await delay(800 + Math.random() * 700);

        // Проверяем отмену перед запросом
        if (isCancelled()) {
            throw new Error("cancelled");
        }

        // Загружаем главу
        let { title: chTitle, xhtml } = await getChapter(chapter.href);

        // Проверяем отмену после запроса
        if (isCancelled()) {
            throw new Error("cancelled");
        }

        tocEntries.push({
            id: `ch${chapterIndex}`,
            title: chTitle
        });

        fb2Chapters += `
<section id="ch${chapterIndex}">
    <title><p>${chTitle}</p></title>
    ${xhtml}
</section>`;

        chapterIndex++;
    }

    // ---------- TOC ----------
    let fb2Toc = buildFb2Toc(tocEntries);

    // ---------- BODY ----------
    let fb2Body = buildFb2Body(fb2Chapters);

    const baseName = generateFileBaseName(mainAuthor.name, title);
    const fileName = `${baseName}.fb2`;

    let blob = new Blob([fb2Header + fb2Toc + fb2Body], { type: "application/xml" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}
