import { createFB2 } from "./fb2/fb2Builder.js";
import { createEPUB } from "./epub/epubBuilder.js";
import { createButtons } from "./ui/buttons.js";

window.addEventListener("load", () => {
    createButtons(createFB2, createEPUB);
});
