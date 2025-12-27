import { createFB2 } from "./fb2/fb2Builder.js";
import { createEPUB } from "./epub/epubBuilder.js";
import { createButtons } from "./ui/buttons.js";

function insertButtons() {
    if (!document.querySelector("#ficbook-export-buttons")) {
        console.log("Вставляем кнопки");
        createButtons(createFB2, createEPUB);
    }
}

// 1. Запускаем сразу
insertButtons();

// 2. Если DOM ещё не готов — подождём
document.addEventListener("DOMContentLoaded", insertButtons);

// 3. Подстраховка: если Ficbook перерисует страницу
const observer = new MutationObserver(insertButtons);
observer.observe(document.body, { childList: true, subtree: true });
