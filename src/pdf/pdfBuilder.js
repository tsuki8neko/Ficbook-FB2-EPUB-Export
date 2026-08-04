import { collectBook } from "../core/collectBook.js";
import { generateFileBaseName } from "../utils/generateFileName.js";
import { downloadBlob } from "../utils/download.js";
import { loadExternalScript } from "../utils/loadLibrary.js";

function linkFragment(url, label = url) {
    if (!url) {
        return {
            text: label || ""
        };
    }

    return {
        text: label || url,
        link: url,
        decoration: "underline",
        color: "#0645ad"
    };
}

function linkedValue(label, url) {
    if (!label && !url) return [];

    if (!url) {
        return [
            {
                text: label || ""
            }
        ];
    }

    return [
        {
            text: label || url
        },
        {
            text: " ("
        },
        linkFragment(url),
        {
            text: ")"
        }
    ];
}

function peopleValue(people) {
    const fragments = [];

    (people || []).forEach((person, index) => {
        if (index) {
            fragments.push({
                text: ", "
            });
        }

        fragments.push(
            ...linkedValue(person.name, person.url)
        );
    });

    return fragments;
}

function plainValue(value) {
    if (Array.isArray(value)) {
        return [
            {
                text: value.join(", ")
            }
        ];
    }

    return [
        {
            text: String(value ?? "")
        }
    ];
}

function metaRows(meta) {
    const rows = [];

    const add = (label, fragments) => {
        if (
            !fragments?.length ||
            fragments.every(fragment =>
                !String(fragment.text || "").trim()
            )
        ) {
            return;
        }

        rows.push({
            text: [
                {
                    text: `${label}: `,
                    bold: true
                },
                ...fragments
            ],
            margin: [0, 1, 0, 1]
        });
    };

    add(
        "Ссылка",
        meta.sourceUrl
            ? [linkFragment(meta.sourceUrl)]
            : []
    );

    add(
        "Направленность",
        meta.direction
            ? plainValue(meta.direction)
            : []
    );

    add(
        "Рейтинг",
        meta.rating
            ? plainValue(meta.rating)
            : []
    );

    add(
        "Статус",
        meta.status
            ? plainValue(meta.status)
            : []
    );

    add(
        "Размер",
        meta.size
            ? plainValue(`${meta.size} слов`)
            : []
    );

    add(
        "Фэндом",
        meta.fandom
            ? plainValue(meta.fandom)
            : []
    );

    add(
        "Пейринги и персонажи",
        meta.pairings?.length
            ? plainValue(meta.pairings)
            : []
    );

    /*
     * Выводим каждый раздел меток отдельно:
     *
     * Предупреждения: ...
     * Другие метки: ...
     *
     * Для старых данных без tagSections используется общий meta.tags.
     */
    const tagSections = Array.isArray(meta.tagSections)
        ? meta.tagSections.filter(section =>
            section?.label &&
            Array.isArray(section.tags) &&
            section.tags.length
        )
        : [];

    if (tagSections.length) {
        tagSections.forEach(section => {
            add(
                section.label,
                plainValue(section.tags)
            );
        });
    } else {
        add(
            "Метки",
            meta.tags
                ? plainValue(meta.tags)
                : []
        );
    }

    add(
        "Серия",
        meta.series
            ? linkedValue(
            meta.series.name,
            meta.series.url
            )
            : []
    );

    add(
        "Соавторы",
        peopleValue(meta.coauthors)
    );

    add(
        "Переводчики",
        peopleValue(meta.translators)
    );

    add(
        "Бета",
        peopleValue(meta.betas)
    );

    add(
        "Гамма",
        peopleValue(meta.gammas)
    );

    add(
        "Автор оригинала",
        meta.originalAuthor
            ? linkedValue(
            meta.originalAuthor.name,
            meta.originalAuthor.url
            )
            : []
    );

    add(
        "Оригинал",
        meta.originalWork?.url
            ? [linkFragment(meta.originalWork.url)]
            : []
    );

    return rows;
}

function paragraphNodes(text) {
    return String(text || "")
        .split(/\n{2,}/)
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => ({
            text: part,
            style: "body",
            margin: [0, 0, 0, 7]
        }));
}

function getPdfBlob(pdfMake, definition) {
    return new Promise((resolve, reject) => {
        try {
            pdfMake
                .createPdf(definition)
                .getBlob(resolve);
        } catch (error) {
            reject(error);
        }
    });
}

export function buildPdfDefinition({
                                       meta,
                                       cover,
                                       chapters
                                   }) {
    const content = [];

    if (cover) {
        content.push({
            image: cover.dataUrl,
            fit: [360, 500],
            alignment: "center",
            margin: [0, 0, 0, 18]
        });
    }

    content.push({
        text: meta.title,
        style: "title"
    });

    content.push({
        text: linkedValue(
            meta.mainAuthor?.name || "Неизвестный автор",
            meta.mainAuthor?.url
        ),
        style: "author"
    });

    content.push(...metaRows(meta));

    if (meta.description) {
        content.push(
            {
                text: "Описание",
                style: "section"
            },
            ...paragraphNodes(meta.description)
        );
    }

    if (meta.notes) {
        content.push(
            {
                text: "Примечания автора",
                style: "section"
            },
            ...paragraphNodes(meta.notes)
        );
    }

    if (meta.otherPublication) {
        content.push(
            {
                text: "Публикация на других ресурсах",
                style: "section"
            },
            ...paragraphNodes(meta.otherPublication)
        );
    }

    if (chapters.length) {
        content.push({
            toc: {
                id: "chaptersToc",
                title: {
                    text: "Оглавление",
                    style: "tocTitle"
                },
                textStyle: "tocEntry",
                numberStyle: "tocPageNumber"
            },
            pageBreak: "before"
        });
    }

    chapters.forEach((chapter, index) => {
        const destinationId = `chapter-${index + 1}`;

        content.push({
            text: `${chapter.number}. ${chapter.title}`,
            style: "chapter",
            id: destinationId,
            tocItem: "chaptersToc",
            pageBreak: "before"
        });

        content.push(
            ...paragraphNodes(chapter.plain)
        );

        if (chapter.footnotes?.length) {
            content.push({
                text: "Сноски",
                style: "footnoteHeading"
            });

            chapter.footnotes.forEach(note => {
                content.push({
                    text: `[${note.number}] ${note.text}`,
                    style: "footnote"
                });
            });
        }
    });

    return {
        info: {
            title: meta.title,
            author:
                meta.mainAuthor?.name ||
                "UnknownAuthor",
            subject:
                meta.fandom ||
                "fanfiction",

            /*
             * В служебных метаданных PDF оставляем
             * общий список всех меток.
             */
            keywords: meta.tags || ""
        },

        pageSize: "A4",
        pageMargins: [54, 54, 54, 58],

        defaultStyle: {
            font: "Roboto",
            fontSize: 11,
            lineHeight: 1.25
        },

        styles: {
            title: {
                fontSize: 22,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 8]
            },

            author: {
                fontSize: 14,
                alignment: "center",
                margin: [0, 0, 0, 18]
            },

            section: {
                fontSize: 15,
                bold: true,
                margin: [0, 16, 0, 8]
            },

            tocTitle: {
                fontSize: 20,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 18]
            },

            tocEntry: {
                fontSize: 11,
                margin: [0, 3, 0, 3]
            },

            tocPageNumber: {
                fontSize: 10,
                bold: true
            },

            chapter: {
                fontSize: 17,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 18]
            },

            body: {
                fontSize: 11,
                alignment: "justify"
            },

            footnoteHeading: {
                fontSize: 11,
                bold: true,
                margin: [0, 12, 0, 5]
            },

            footnote: {
                fontSize: 9,
                margin: [0, 0, 0, 4]
            }
        },

        footer: (currentPage, pageCount) => ({
            text: `${currentPage} / ${pageCount}`,
            alignment: "center",
            fontSize: 8,
            margin: [0, 15, 0, 0]
        }),

        content
    };
}

export async function createPDF(
    onProgress = () => {},
    isCancelled = () => false
) {
    const pdfMake = await loadExternalScript(
        [
            "https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/pdfmake.min.js",
            "https://unpkg.com/pdfmake@0.2.20/build/pdfmake.min.js"
        ],
        "pdfMake"
    );

    const pdfFonts = await loadExternalScript([
        "https://cdn.jsdelivr.net/npm/pdfmake@0.2.20/build/vfs_fonts.js",
        "https://unpkg.com/pdfmake@0.2.20/build/vfs_fonts.js"
    ]);

    if (
        pdfFonts &&
        pdfFonts !== true &&
        typeof pdfMake.addVirtualFileSystem === "function"
    ) {
        pdfMake.addVirtualFileSystem(
            pdfFonts.default || pdfFonts
        );
    }

    const book = await collectBook(
        onProgress,
        isCancelled
    );

    const { meta } = book;
    const definition = buildPdfDefinition(book);
    const blob = await getPdfBlob(
        pdfMake,
        definition
    );

    const translator =
        meta.translators?.[0]?.name;

    const titlePart = translator
        ? `${meta.title}_[${translator}]`
        : meta.title;

    const fileName =
        `${generateFileBaseName(
            meta.mainAuthor?.name || "UnknownAuthor",
            titlePart
        )}.pdf`;

    downloadBlob(blob, fileName);
}