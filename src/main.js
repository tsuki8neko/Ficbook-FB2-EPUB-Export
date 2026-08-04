import { createFB2 } from "./fb2/fb2Builder.js";
import { createEPUB } from "./epub/epubBuilder.js";
import { createTXT } from "./txt/txtBuilder.js";
import { createPDF } from "./pdf/pdfBuilder.js";
import { createButtons } from "./ui/buttons.js";

const exporters = { fb2: createFB2, epub: createEPUB, txt: createTXT, pdf: createPDF };
let observer = null;
let insertionScheduled = false;

function insertButtons() {
    insertionScheduled = false;
    if (!document.body || document.querySelector("#ficbook-export-buttons .fbe-inline-trigger")) return;
    createButtons(exporters);
}

function scheduleInsert() {
    if (insertionScheduled) return;
    insertionScheduled = true;
    requestAnimationFrame(insertButtons);
}

function start() {
    insertButtons();
    if (observer || !document.body) return;
    observer = new MutationObserver(scheduleInsert);
    observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
