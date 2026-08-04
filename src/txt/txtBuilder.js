import { collectBook } from "../core/collectBook.js";
import { generateFileBaseName } from "../utils/generateFileName.js";
import { downloadBlob } from "../utils/download.js";

function addLine(lines, label, value) {
    if (
        !value ||
        (Array.isArray(value) && !value.length)
    ) {
        return;
    }

    const text = Array.isArray(value)
        ? value.join(", ")
        : value;

    lines.push(`${label}: ${text}`);
}

function addTagSections(lines, meta) {
    const tagSections = Array.isArray(meta.tagSections)
        ? meta.tagSections.filter(section =>
            section?.label &&
            Array.isArray(section.tags) &&
            section.tags.length
        )
        : [];

    /*
     * Выводим метки по разделам Ficbook:
     *
     * Предупреждения: ...
     * Другие метки: ...
     */
    if (tagSections.length) {
        tagSections.forEach(section => {
            addLine(
                lines,
                section.label,
                section.tags
            );
        });

        return;
    }

    /*
     * Резервный вариант для старых данных,
     * в которых tagSections ещё отсутствует.
     */
    addLine(lines, "Метки", meta.tags);
}

function buildHeader(meta) {
    const lines = [
        meta.title,
        meta.mainAuthor?.name || "Неизвестный автор",
        ""
    ];

    addLine(lines, "Ссылка", meta.sourceUrl);
    addLine(lines, "Направленность", meta.direction);
    addLine(lines, "Рейтинг", meta.rating);
    addLine(lines, "Статус", meta.status);

    addLine(
        lines,
        "Размер",
        meta.size
            ? `${meta.size} слов`
            : ""
    );

    addLine(lines, "Фэндом", meta.fandom);

    addLine(
        lines,
        "Пейринги и персонажи",
        meta.pairings
    );

    addTagSections(lines, meta);

    addLine(
        lines,
        "Серия",
        meta.series?.name
    );

    addLine(
        lines,
        "Соавторы",
        meta.coauthors?.map(author => author.name)
    );

    addLine(
        lines,
        "Переводчики",
        meta.translators?.map(author => author.name)
    );

    addLine(
        lines,
        "Бета",
        meta.betas?.map(author => author.name)
    );

    addLine(
        lines,
        "Гамма",
        meta.gammas?.map(author => author.name)
    );

    addLine(
        lines,
        "Автор оригинала",
        meta.originalAuthor?.name
    );

    addLine(
        lines,
        "Оригинал",
        meta.originalWork?.url
    );

    if (meta.description) {
        lines.push(
            "",
            "Описание",
            meta.description
        );
    }

    if (meta.notes) {
        lines.push(
            "",
            "Примечания автора",
            meta.notes
        );
    }

    if (meta.otherPublication) {
        lines.push(
            "",
            "Публикация на других ресурсах",
            meta.otherPublication
        );
    }

    return lines.join("\n");
}

export async function createTXT(
    onProgress = () => {},
    isCancelled = () => false
) {
    const { meta, chapters } = await collectBook(
        onProgress,
        isCancelled
    );

    const parts = [
        buildHeader(meta),
        "",
        "=".repeat(72)
    ];

    for (const chapter of chapters) {
        parts.push(
            "",
            `${chapter.number}. ${chapter.title}`,
            "-".repeat(72),
            "",
            chapter.plain
        );

        if (chapter.footnotes?.length) {
            parts.push("", "Сноски:");

            chapter.footnotes.forEach(note => {
                parts.push(
                    `[${note.number}] ${note.text}`
                );
            });
        }
    }

    const translator =
        meta.translators?.[0]?.name;

    const titlePart = translator
        ? `${meta.title}_[${translator}]`
        : meta.title;

    const fileName =
        `${generateFileBaseName(
            meta.mainAuthor?.name || "UnknownAuthor",
            titlePart
        )}.txt`;

    downloadBlob(
        new Blob(
            [
                "\ufeff",
                parts.join("\n")
            ],
            {
                type: "text/plain;charset=utf-8"
            }
        ),
        fileName
    );
}