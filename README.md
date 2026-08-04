# Ficbook Exporter — FB2, EPUB, PDF and TXT Downloader

Userscript для скачивания произведений с [Ficbook](https://ficbook.net) и чтения их офлайн.

## Как выглядит кнопка

<p align="left"><img src="https://raw.githubusercontent.com/tsuki8neko/Ficbook-FB2-EPUB-Export/refs/heads/master/button.jpg" alt="Меню выбора формата Ficbook Exporter" width="320">
</p>

Кнопка «Скачать» добавляется в штатную панель действий произведения.

Поддерживаются форматы **FB2**, **EPUB**, **PDF** и **TXT**.


## Возможности

- скачивание произведения со страницы работы или любой открытой главы;
- загрузка всех доступных глав с сохранением их порядка и названий;
- экспорт в **FB2**, **EPUB**, **PDF** и **TXT**;
- сохранение обложки в FB2, EPUB и PDF;
- поддержка обложек JPEG, PNG и WebP с преобразованием для совместимости с читалками;
- сохранение сносок и структуры текста;
- оглавление в FB2, EPUB и PDF;
- кликабельное оглавление с номерами страниц в PDF;
- сохранение доступной информации из шапки произведения:
    - автора, соавторов, переводчиков, бет и гамм;
    - ссылок на страницы участников;
    - фэндома, пэйрингов и персонажей;
    - рейтинга, направленности, статуса и размера;
    - серии, меток, описания, примечаний и условий публикации;
    - ссылки на исходную страницу работы.

Информация из шапки сохраняется во всех форматах, насколько это позволяет выбранный формат. Её расположение и кликабельность ссылок могут отличаться в зависимости от программы чтения.

> TXT — простой текстовый формат, поэтому в нём нет встроенной обложки и сложного форматирования.

## Установка

1. Установите менеджер userscript:
    - **Tampermonkey** — [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) или [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo);
    - **Violentmonkey** — [Firefox](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/).
2. Откройте страницу [Releases](https://github.com/tsuki8neko/Ficbook-FB2-EPUB-Export/releases).
3. Скачайте файл `ficbook-export.user.js` из последней версии.
4. Откройте скачанный файл и подтвердите установку в Tampermonkey или Violentmonkey.

Последнюю опубликованную версию также можно установить напрямую:

**[Установить Ficbook Exporter](https://github.com/tsuki8neko/Ficbook-FB2-EPUB-Export/releases/latest/download/ficbook-export.user.js)**

При установке менеджер может запросить доступ к Ficbook, серверу обложек `assets.teinon.net` и внешним библиотекам. Эти разрешения нужны для загрузки глав, изображений и создания EPUB/PDF.

## Использование

1. Откройте произведение или любую его главу на Ficbook. Адрес должен начинаться так:

   ```text
   https://ficbook.net/readfic/
   ```

2. В панели произведения появится компактная кнопка **«Скачать»**. Она находится рядом с кнопками **«В сборник»** и **«Все сборники»**.
3. Нажмите её и выберите нужный пункт:
    - **Скачать FB2**;
    - **Скачать EPUB**;
    - **Скачать PDF**;
    - **Скачать TXT**.
4. Во время загрузки на кнопке отображаются формат и количество обработанных глав.
5. Чтобы остановить экспорт, нажмите эту же кнопку ещё раз.

После обработки книга будет сохранена через браузер.

## Если экспорт не работает

- Обновите страницу Ficbook после установки или обновления скрипта.
- Убедитесь, что используется последняя версия userscript.
- Разрешите скрипту доступ к `assets.teinon.net`, иначе обложка не загрузится.
- Проверьте, не блокирует ли браузер или расширение доступ к CDN: он требуется для создания EPUB и PDF.
- Если хотя бы одна глава не загрузилась после трёх попыток, файл не создаётся. Скрипт покажет список проблемных глав, чтобы вы могли повторить экспорт и получить полную книгу.

## Дисклеймер

Проект предназначен для личного и образовательного использования.

Пожалуйста, уважайте авторов, условия публикации произведений и правила Ficbook. Не распространяйте скачанные тексты без разрешения правообладателей.

---

# Ficbook Exporter — FB2, EPUB, PDF and TXT Downloader

A userscript for downloading works from [Ficbook](https://ficbook.net) for offline reading.

Supported formats: **FB2**, **EPUB**, **PDF**, and **TXT**.

## Features

- start the export from a work page or any chapter page;
- download all available chapters in the correct order;
- embed the cover in FB2, EPUB, and PDF;
- support JPEG, PNG, and WebP covers;
- preserve chapter titles, text structure, and footnotes;
- generate a table of contents in FB2, EPUB, and PDF;
- generate a clickable PDF table of contents with page numbers;
- preserve available work information, including contributors and their profile links, fandom, pairings, rating, status, tags, series, description, notes, publication permission, and the source URL.

Header information is included in every format as far as that format allows. Its placement and link behavior may depend on the reading application.

> TXT is a plain-text format and therefore does not contain an embedded cover or advanced formatting.

## Installation

1. Install a userscript manager:
    - **Tampermonkey** — [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo);
    - **Violentmonkey** — [Firefox](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/).
2. Open the [Releases](https://github.com/tsuki8neko/Ficbook-FB2-EPUB-Export/releases) page.
3. Download `ficbook-export.user.js` from the latest release.
4. Open the downloaded file and confirm the installation.

The latest published version can also be installed directly:

**[Install Ficbook Exporter](https://github.com/tsuki8neko/Ficbook-FB2-EPUB-Export/releases/latest/download/ficbook-export.user.js)**

## Usage

1. Open a Ficbook work or chapter page whose address starts with:

   ```text
   https://ficbook.net/readfic/
   ```

2. A compact **Download** button appears next to the **Add to collection** and **All collections** controls.
3. Click it and select **Download FB2**, **Download EPUB**, **Download PDF**, or **Download TXT**.
4. The button displays the current format and chapter progress while the file is being prepared.
5. Click the same button again to stop the export.

The generated file will be saved by the browser.

If any chapter still cannot be loaded after three attempts, no file is created. The script lists the failed chapters so that the export can be retried later without saving an incomplete book.

## Disclaimer

This project is intended for personal and educational use only.

Please respect the authors, publication permissions, and Ficbook rules. Do not redistribute downloaded works without permission from the copyright holders.

---

### Keywords

ficbook downloader, ficbook fanfic downloader, download ficbook stories, скачать фикбук, фикбук скачать фанфик, ficbook epub download, ficbook fb2 download, ficbook pdf download, ficbook txt download, ficbook export, ficbook userscript, fanfiction downloader
