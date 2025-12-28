import { getTitle } from "../core/getTitle.js";
import { getAuthors } from "../core/getAuthors.js";
import { getExtraData, getDirectionRatingStatus } from "../core/getMeta.js";
import { getChapter } from "../core/getChapter.js";
import { delay } from "../utils/delay.js";
import { generateFileBaseName } from "../utils/generateFileName.js";

import { buildFb2Header } from "./fb2Header.js";
import { buildFb2Toc } from "./fb2Toc.js";
import { buildFb2Body } from "./fb2Body.js";

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

        if (isCancelled()) throw new Error("cancelled");

        onProgress(chapterIndex, total);

        if (isCancelled()) throw new Error("cancelled");

        await delay(800 + Math.random() * 700);

        if (isCancelled()) throw new Error("cancelled");

        let { title: chTitle, xhtml } = await getChapter(chapter.href);

        if (isCancelled()) throw new Error("cancelled");

        // НУМЕРАЦИЯ В ОГЛАВЛЕНИИ (теперь с •)
        tocEntries.push({
            id: `ch${chapterIndex}`,
            title: `•\u2003${chTitle}`
        });

        // НУМЕРАЦИЯ В ТЕКСТЕ FB2 (теперь с •)
        fb2Chapters += `
        <section id="ch${chapterIndex}">
            <title><p>•\u2003${chTitle}</p></title>
            ${xhtml}
        </section>`;


        chapterIndex++;
    }

    let fb2Toc = buildFb2Toc(tocEntries);
    let fb2Body = buildFb2Body(fb2Chapters);

    const baseName = generateFileBaseName(mainAuthor.name, title);
    const fileName = `${baseName}.fb2`;

    let blob = new Blob(
        [fb2Header + fb2Toc + fb2Body],
        { type: "text/xml" }
    );

    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}
