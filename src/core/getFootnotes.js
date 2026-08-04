import { escapeXml } from "../utils/escapeXml.js";

/** Заменяет сноски в тексте на нейтральные placeholder-элементы. */
export function extractFootnotes(doc, contentNode, notesMap = {}) {
    const anchors = [...contentNode.querySelectorAll("span.footnote[id]")];
    const notes = [];

    anchors.forEach((anchor, index) => {
        const id = anchor.id;
        const rawHtml = notesMap[id];
        if (!rawHtml) return;

        const number = index + 1;
        const holder = doc.createElement("div");
        holder.innerHTML = String(rawHtml);
        const text = (holder.textContent || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

        const ref = doc.createElement("footnote-ref");
        ref.setAttribute("id", id);
        ref.setAttribute("number", String(number));
        anchor.replaceWith(ref);

        notes.push({ id, number, text, html: escapeXml(text) });
    });

    return notes;
}
