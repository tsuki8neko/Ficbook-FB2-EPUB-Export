// ==UserScript==
// @name         Ficbook FB2 & EPUB Export
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Ficbook FB2 & EPUB Export
// @author       Moon Cat
// @match        https://ficbook.net/readfic/*
// @grant        none
// @updateURL   https://raw.githubusercontent.com/tsuki8neko/Ficbook-FB2-EPUB-Export/master/dist/ficbook-export.user.js
// @downloadURL https://raw.githubusercontent.com/tsuki8neko/Ficbook-FB2-EPUB-Export/master/dist/ficbook-export.user.js
// ==/UserScript==

/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ var __webpack_modules__ = ({

/***/ "./src/core/getAuthors.js"
/*!********************************!*\
  !*** ./src/core/getAuthors.js ***!
  \********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getAuthors: () => (/* binding */ getAuthors)\n/* harmony export */ });\nfunction getAuthors() {\n    const hat = document.querySelector(\".fanfic-hat-body\");\n    const authorsNodes = hat.querySelectorAll(\".creator-info .creator-username\");\n    return Array.from(authorsNodes).map(a => ({\n        name: a.innerText.trim(),\n        url: a.href\n    }));\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/core/getAuthors.js?\n}");

/***/ },

/***/ "./src/core/getChapter.js"
/*!********************************!*\
  !*** ./src/core/getChapter.js ***!
  \********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getChapter: () => (/* binding */ getChapter)\n/* harmony export */ });\n/* harmony import */ var _utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/textToParagraphs.js */ \"./src/utils/textToParagraphs.js\");\n\n\nasync function getChapter(url) {\n    let res = await fetch(url);\n    let html = await res.text();\n    let doc = new DOMParser().parseFromString(html, \"text/html\");\n\n    let title = doc.querySelector(\".title-area h2, .part-title h3\")?.innerText.trim() || \"Глава\";\n\n    let contentNode = doc.querySelector(\"#part_content\");\n    if (contentNode) {\n        contentNode.querySelectorAll(\n            \".js-collapsible, .js-text-settings-collapse-button, .ad, .part-footer, .chapter-time, .text_settings, .tags\"\n        ).forEach(el => el.remove());\n\n        contentNode.querySelector(\"h1, h2, h3\")?.remove();\n    }\n\n    let content = contentNode ? contentNode.innerText : \"\";\n\n    return {\n        title,\n        plain: content.trim(),\n        xhtml: (0,_utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_0__.textToParagraphs)(content)\n    };\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/core/getChapter.js?\n}");

/***/ },

/***/ "./src/core/getMeta.js"
/*!*****************************!*\
  !*** ./src/core/getMeta.js ***!
  \*****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getDirectionRatingStatus: () => (/* binding */ getDirectionRatingStatus),\n/* harmony export */   getExtraData: () => (/* binding */ getExtraData)\n/* harmony export */ });\nfunction getExtraData() {\n    const findBlock = (label) =>\n        Array.from(document.querySelectorAll(\".description .mb-10\"))\n            .find(n => n.querySelector(\"strong\")?.innerText.includes(label));\n\n    const fandomBlock = findBlock(\"Фэндом:\");\n    const fandom = fandomBlock\n        ? Array.from(fandomBlock.querySelectorAll(\"a\")).map(a => a.innerText.trim()).join(\", \")\n        : \"\";\n\n    const sizeBlock = findBlock(\"Размер:\");\n    let size = \"\";\n    if (sizeBlock) {\n        const match = sizeBlock.innerText.match(/(\\d[\\d\\s]*\\d)\\s*слов/);\n        size = match ? match[1] : \"\";\n    }\n\n    const tagsNode = document.querySelector(\".description .tags\");\n    const tags = tagsNode\n        ? Array.from(tagsNode.querySelectorAll(\"a\")).map(a => a.innerText.trim()).join(\", \")\n        : \"\";\n\n    const description = document.querySelector(\".description .js-public-beta-description\")?.innerText.trim() || \"\";\n    const notes = document.querySelector(\".description .js-public-beta-author-comment\")?.innerText.trim() || \"\";\n\n    const otherPublicationBlock = findBlock(\"Публикация на других ресурсах:\");\n    const otherPublication = otherPublicationBlock\n        ? otherPublicationBlock.innerText.trim()\n        : \"\";\n\n    return { fandom, size, tags, description, notes, otherPublication };\n}\n\nfunction getDirectionRatingStatus() {\n    const direction = document.querySelector(\".fanfic-badges .badge-with-icon.direction .badge-text\")?.innerText.trim() || \"\";\n    const rating = document.querySelector(\".fanfic-badges .badge-with-icon[class*='badge-rating'] .badge-text\")?.innerText.trim() || \"\";\n    const status = document.querySelector(\".fanfic-badges .badge-with-icon[class*='badge-status'] .badge-text\")?.innerText.trim() || \"\";\n    return { direction, rating, status };\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/core/getMeta.js?\n}");

/***/ },

/***/ "./src/core/getTitle.js"
/*!******************************!*\
  !*** ./src/core/getTitle.js ***!
  \******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getTitle: () => (/* binding */ getTitle)\n/* harmony export */ });\nfunction getTitle() {\n    return document.querySelector(\"h1.heading[itemprop='name']\")?.innerText.trim() || \"Фанфик\";\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/core/getTitle.js?\n}");

/***/ },

/***/ "./src/epub/epubBuilder.js"
/*!*********************************!*\
  !*** ./src/epub/epubBuilder.js ***!
  \*********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createEPUB: () => (/* binding */ createEPUB)\n/* harmony export */ });\n/* harmony import */ var _core_getTitle_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/getTitle.js */ \"./src/core/getTitle.js\");\n/* harmony import */ var _core_getAuthors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/getAuthors.js */ \"./src/core/getAuthors.js\");\n/* harmony import */ var _core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/getMeta.js */ \"./src/core/getMeta.js\");\n/* harmony import */ var _core_getChapter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/getChapter.js */ \"./src/core/getChapter.js\");\n/* harmony import */ var _utils_generateFileName_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/generateFileName.js */ \"./src/utils/generateFileName.js\");\n/* harmony import */ var _epubCss_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./epubCss.js */ \"./src/epub/epubCss.js\");\n/* harmony import */ var _epubTemplates_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./epubTemplates.js */ \"./src/epub/epubTemplates.js\");\n/* harmony import */ var _epubOpf_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./epubOpf.js */ \"./src/epub/epubOpf.js\");\n/* harmony import */ var _epubNcx_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./epubNcx.js */ \"./src/epub/epubNcx.js\");\n\n\n\n\n\n\n\n\n\n\n\nasync function createEPUB(onProgress = () => {}) {\n    // JSZip loader\n    if (!window.JSZip) {\n        await new Promise((resolve, reject) => {\n            const s = document.createElement(\"script\");\n            s.src = \"https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js\";\n            s.onload = resolve;\n            s.onerror = () => reject(new Error(\"Не удалось загрузить JSZip\"));\n            document.head.appendChild(s);\n        });\n    }\n\n    const title = (0,_core_getTitle_js__WEBPACK_IMPORTED_MODULE_0__.getTitle)();\n    const authors = (0,_core_getAuthors_js__WEBPACK_IMPORTED_MODULE_1__.getAuthors)();\n    if (!authors.length) {\n        alert(\"Авторы не найдены, возможно, изменился HTML Ficbook.\");\n        return;\n    }\n    const mainAuthor = authors[0];\n    const coauthors = authors.slice(1).map(a => a.name).join(\", \");\n\n    const { fandom, size, tags, description, notes, otherPublication } = (0,_core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__.getExtraData)();\n    const { direction, rating, status } = (0,_core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__.getDirectionRatingStatus)();\n\n    // ---------- СБОР ГЛАВ ----------\n    const chaptersNodes = document.querySelectorAll(\".list-of-fanfic-parts .part-link\");\n    const chapters = [];\n    let index = 1;\n\n    for (let chapter of chaptersNodes) {\n\n        onProgress(index, chaptersNodes.length);\n\n        let { title: chTitle, xhtml } = await (0,_core_getChapter_js__WEBPACK_IMPORTED_MODULE_3__.getChapter)(chapter.href);\n        chapters.push({\n            id: `chapter${index}`,\n            file: `chapter${index}.xhtml`,\n            title: chTitle,\n            content: xhtml\n        });\n        index++;\n    }\n\n    const zip = new JSZip();\n\n    // mimetype\n    zip.file(\"mimetype\", \"application/epub+zip\", { compression: \"STORE\" });\n\n    // META-INF/container.xml\n    zip.file(\"META-INF/container.xml\", `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<container version=\"1.0\"\n    xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n    <rootfiles>\n        <rootfile full-path=\"OEBPS/content.opf\"\n            media-type=\"application/oebps-package+xml\"/>\n    </rootfiles>\n</container>`);\n\n    // CSS\n    zip.file(\"OEBPS/style.css\", _epubCss_js__WEBPACK_IMPORTED_MODULE_5__.epubCss.trim());\n\n    // Title page\n    zip.file(\"OEBPS/titlepage.xhtml\", (0,_epubTemplates_js__WEBPACK_IMPORTED_MODULE_6__.buildTitlePage)({\n        title,\n        mainAuthor,\n        coauthors,\n        direction,\n        rating,\n        size,\n        status,\n        tags,\n        description,\n        notes,\n        otherPublication\n    }));\n\n    // Chapters\n    chapters.forEach(ch => {\n        zip.file(`OEBPS/${ch.file}`, (0,_epubTemplates_js__WEBPACK_IMPORTED_MODULE_6__.buildChapterPage)(ch));\n    });\n\n    // TOC XHTML\n    zip.file(\"OEBPS/toc.xhtml\", (0,_epubTemplates_js__WEBPACK_IMPORTED_MODULE_6__.buildTocXhtml)(chapters));\n\n    // content.opf\n    zip.file(\"OEBPS/content.opf\", (0,_epubOpf_js__WEBPACK_IMPORTED_MODULE_7__.buildOpf)({\n        title,\n        mainAuthor,\n        description,\n        chapters\n    }));\n\n    // toc.ncx\n    zip.file(\"OEBPS/toc.ncx\", (0,_epubNcx_js__WEBPACK_IMPORTED_MODULE_8__.buildNcx)(title, chapters));\n\n    // ---------- Генерация EPUB ----------\n    const baseName = (0,_utils_generateFileName_js__WEBPACK_IMPORTED_MODULE_4__.generateFileBaseName)(mainAuthor.name, title);\n    const fileName = `${baseName}.epub`;\n\n    const blob = await zip.generateAsync({ type: \"blob\" });\n    const link = document.createElement(\"a\");\n    link.href = URL.createObjectURL(blob);\n    link.download = fileName;\n    link.click();\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/epub/epubBuilder.js?\n}");

/***/ },

/***/ "./src/epub/epubCss.js"
/*!*****************************!*\
  !*** ./src/epub/epubCss.js ***!
  \*****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   epubCss: () => (/* binding */ epubCss)\n/* harmony export */ });\nconst epubCss = `\nbody {\n    margin: 0;\n    padding: 0 8%;\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;\n    line-height: 1.6;\n    font-size: 1em;\n}\nh1, h2, h3 {\n    font-weight: 600;\n    margin: 1.2em 0 0.6em;\n}\nh1 {\n    font-size: 1.6em;\n    text-align: center;\n}\np {\n    margin: 0.6em 0;\n}\nstrong {\n    font-weight: 600;\n}\n.title-page {\n    margin-top: 20%;\n    text-align: center;\n}\n.title-page h1 {\n    font-size: 1.8em;\n    margin-bottom: 0.4em;\n}\n.title-page h2 {\n    font-size: 1.2em;\n    margin-top: 0;\n    color: #555;\n}\n.meta-block {\n    margin-top: 2em;\n    font-size: 0.9em;\n    color: #555;\n}\n.meta-block p {\n    margin: 0.2em 0;\n}\n`;\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/epub/epubCss.js?\n}");

/***/ },

/***/ "./src/epub/epubNcx.js"
/*!*****************************!*\
  !*** ./src/epub/epubNcx.js ***!
  \*****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildNcx: () => (/* binding */ buildNcx)\n/* harmony export */ });\n/* harmony import */ var _utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/escapeXml.js */ \"./src/utils/escapeXml.js\");\n\n\nfunction buildNcx(title, chapters) {\n    const navPoints = chapters.map((ch, i) => `\n        <navPoint id=\"navPoint-${i + 3}\" playOrder=\"${i + 3}\">\n            <navLabel><text>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(ch.title)}</text></navLabel>\n            <content src=\"${ch.file}\"/>\n        </navPoint>\n    `).join(\"\\n\");\n\n    return `\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\"\n    version=\"2005-1\">\n    <head>\n        <meta name=\"dtb:uid\" content=\"urn:uuid:${Date.now()}\"/>\n        <meta name=\"dtb:depth\" content=\"1\"/>\n        <meta name=\"dtb:totalPageCount\" content=\"0\"/>\n        <meta name=\"dtb:maxPageNumber\" content=\"0\"/>\n    </head>\n    <docTitle>\n        <text>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</text>\n    </docTitle>\n    <navMap>\n        <navPoint id=\"navPoint-1\" playOrder=\"1\">\n            <navLabel><text>Титульная страница</text></navLabel>\n            <content src=\"titlepage.xhtml\"/>\n        </navPoint>\n        <navPoint id=\"navPoint-2\" playOrder=\"2\">\n            <navLabel><text>Оглавление</text></navLabel>\n            <content src=\"toc.xhtml\"/>\n        </navPoint>\n        ${navPoints}\n    </navMap>\n</ncx>\n`.trim();\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/epub/epubNcx.js?\n}");

/***/ },

/***/ "./src/epub/epubOpf.js"
/*!*****************************!*\
  !*** ./src/epub/epubOpf.js ***!
  \*****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildOpf: () => (/* binding */ buildOpf)\n/* harmony export */ });\n/* harmony import */ var _utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/escapeXml.js */ \"./src/utils/escapeXml.js\");\n\n\nfunction buildOpf({ title, mainAuthor, description, chapters }) {\n    const now = new Date();\n    const isoDate = now.toISOString().split(\"T\")[0];\n\n    const manifest = [\n        `<item id=\"css\" href=\"style.css\" media-type=\"text/css\"/>`,\n        `<item id=\"titlepage\" href=\"titlepage.xhtml\" media-type=\"application/xhtml+xml\"/>`,\n        `<item id=\"toc\" href=\"toc.xhtml\" media-type=\"application/xhtml+xml\"/>`,\n        ...chapters.map(ch =>\n            `<item id=\"${ch.id}\" href=\"${ch.file}\" media-type=\"application/xhtml+xml\"/>`\n        ),\n        `<item id=\"ncx\" href=\"toc.ncx\" media-type=\"application/x-dtbncx+xml\"/>`\n    ].join(\"\\n        \");\n\n    const spine = [\n        `<itemref idref=\"titlepage\"/>`,\n        `<itemref idref=\"toc\"/>`,\n        ...chapters.map(ch => `<itemref idref=\"${ch.id}\"/>`)\n    ].join(\"\\n        \");\n\n    return `\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<package version=\"2.0\"\n    xmlns=\"http://www.idpf.org/2007/opf\"\n    unique-identifier=\"BookId\">\n\n        <metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n            <dc:title>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</dc:title>\n            <dc:creator>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)}</dc:creator>\n            <dc:language>ru</dc:language>\n            <dc:identifier id=\"BookId\">urn:uuid:${Date.now()}</dc:identifier>\n            <dc:date>${isoDate}</dc:date>\n            <dc:subject>fiction</dc:subject>\n            <dc:description>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(description.slice(0, 500))}</dc:description>\n            <meta name=\"source\" content=\"${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(location.href)}\"/>\n        </metadata>\n        <manifest>\n            ${manifest}\n        </manifest>\n        <spine toc=\"ncx\">\n            ${spine}\n        </spine>\n    </package>\n`.trim();\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/epub/epubOpf.js?\n}");

/***/ },

/***/ "./src/epub/epubTemplates.js"
/*!***********************************!*\
  !*** ./src/epub/epubTemplates.js ***!
  \***********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildChapterPage: () => (/* binding */ buildChapterPage),\n/* harmony export */   buildTitlePage: () => (/* binding */ buildTitlePage),\n/* harmony export */   buildTocXhtml: () => (/* binding */ buildTocXhtml)\n/* harmony export */ });\n/* harmony import */ var _utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/escapeXml.js */ \"./src/utils/escapeXml.js\");\n/* harmony import */ var _utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/textToParagraphs.js */ \"./src/utils/textToParagraphs.js\");\n\n\n\nfunction buildTitlePage({\n                                   title,\n                                   mainAuthor,\n                                   coauthors,\n                                   direction,\n                                   rating,\n                                   size,\n                                   status,\n                                   tags,\n                                   description,\n                                   notes,\n                                   otherPublication,\n                                   fandom\n                               }) {\n    return `\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"ru\">\n<head>\n    <title>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</title>\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\"/>\n</head>\n<body>\n    <div class=\"title-page\">\n        <h1>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</h1>\n        <h2>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)}</h2>\n        <div class=\"meta-block\">\n            <p><strong>Направленность:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(direction)}</p>\n            <p><strong>Автор:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)}</p>\n            ${coauthors ? `<p><strong>Соавторы:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(coauthors)}</p>` : \"\"}\n            <p><strong>Фэндом:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(fandom)}</p>\n            <p><strong>Рейтинг:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(rating)}</p>\n            <p><strong>Размер:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(size)} слов</p>\n            <p><strong>Статус:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(status)}</p>\n            <p><strong>Метки:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(tags)}</p>\n            <p><strong>Ссылка на оригинал:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(location.href)}</p>\n        </div>\n    </div>\n\n    <h2>Описание</h2>\n    ${(0,_utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__.textToParagraphs)(description)}\n\n    ${notes ? `<h2>Примечания</h2>\\n${(0,_utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__.textToParagraphs)(notes)}` : \"\"}\n\n    ${otherPublication ? `<h2>Публикация на других ресурсах</h2>\\n<p>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(otherPublication)}</p>` : \"\"}\n\n</body>\n</html>\n`.trim();\n}\n\nfunction buildChapterPage(ch) {\n    return `\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"ru\">\n<head>\n    <title>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(ch.title)}</title>\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\"/>\n</head>\n<body>\n    <h1>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(ch.title)}</h1>\n    ${ch.content}\n</body>\n</html>\n`.trim();\n}\n\nfunction buildTocXhtml(chapters) {\n    const tocItems = chapters.map(ch => `\n        <li><a href=\"${ch.file}\">${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(ch.title)}</a></li>\n    `).join(\"\\n\");\n\n    return `\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"ru\">\n<head>\n    <title>Оглавление</title>\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\"/>\n</head>\n<body>\n    <h1>Оглавление</h1>\n    <ol>\n        <li><a href=\"titlepage.xhtml\">Титульная страница</a></li>\n        ${tocItems}\n    </ol>\n</body>\n</html>\n`.trim();\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/epub/epubTemplates.js?\n}");

/***/ },

/***/ "./src/fb2/fb2Body.js"
/*!****************************!*\
  !*** ./src/fb2/fb2Body.js ***!
  \****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildFb2Body: () => (/* binding */ buildFb2Body)\n/* harmony export */ });\nfunction buildFb2Body(fb2Chapters) {\n    return `\n<body>\n${fb2Chapters}\n</body>\n</FictionBook>\n`;\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/fb2/fb2Body.js?\n}");

/***/ },

/***/ "./src/fb2/fb2Builder.js"
/*!*******************************!*\
  !*** ./src/fb2/fb2Builder.js ***!
  \*******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createFB2: () => (/* binding */ createFB2)\n/* harmony export */ });\n/* harmony import */ var _core_getTitle_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/getTitle.js */ \"./src/core/getTitle.js\");\n/* harmony import */ var _core_getAuthors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/getAuthors.js */ \"./src/core/getAuthors.js\");\n/* harmony import */ var _core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/getMeta.js */ \"./src/core/getMeta.js\");\n/* harmony import */ var _core_getChapter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/getChapter.js */ \"./src/core/getChapter.js\");\n/* harmony import */ var _utils_delay_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/delay.js */ \"./src/utils/delay.js\");\n/* harmony import */ var _utils_generateFileName_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/generateFileName.js */ \"./src/utils/generateFileName.js\");\n/* harmony import */ var _fb2Header_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./fb2Header.js */ \"./src/fb2/fb2Header.js\");\n/* harmony import */ var _fb2Toc_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./fb2Toc.js */ \"./src/fb2/fb2Toc.js\");\n/* harmony import */ var _fb2Body_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./fb2Body.js */ \"./src/fb2/fb2Body.js\");\n\n\n\n\n\n\n\n\n\n\n\nasync function createFB2(onProgress = () => {}) {\n    const title = (0,_core_getTitle_js__WEBPACK_IMPORTED_MODULE_0__.getTitle)();\n    const authors = (0,_core_getAuthors_js__WEBPACK_IMPORTED_MODULE_1__.getAuthors)();\n    if (!authors.length) {\n        alert(\"Авторы не найдены, возможно, изменился HTML Ficbook.\");\n        return;\n    }\n    const mainAuthor = authors[0];\n    const coauthors = authors.slice(1).map(a => a.name).join(\", \");\n\n    const { fandom, size, tags, description, notes, otherPublication } = (0,_core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__.getExtraData)();\n    const { direction, rating, status } = (0,_core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__.getDirectionRatingStatus)();\n\n    // ---------- HEADER ----------\n    let fb2Header = (0,_fb2Header_js__WEBPACK_IMPORTED_MODULE_6__.buildFb2Header)({\n        title,\n        mainAuthor,\n        coauthors,\n        direction,\n        rating,\n        size,\n        status,\n        tags,\n        description,\n        notes,\n        otherPublication\n    });\n\n    // ---------- СБОР ГЛАВ ----------\n    let fb2Chapters = \"\";\n    let tocEntries = [];\n    let chapterIndex = 1;\n\n    let rawChapters = Array.from(document.querySelectorAll(\".list-of-fanfic-parts .part-link\"))\n        .filter(ch => {\n            if (!ch.href) return false;\n            if (ch.href.includes(\"/all-parts\")) return false;\n            let clean = ch.href.split(\"#\")[0];\n            let last = clean.split(\"/\").pop();\n            return /^\\d+$/.test(last);\n        });\n\n    let chapters = [];\n    let seen = new Set();\n    for (let ch of rawChapters) {\n        if (!seen.has(ch.href)) {\n            seen.add(ch.href);\n            chapters.push(ch);\n        }\n    }\n\n    for (let chapter of chapters) {\n\n        onProgress(chapterIndex, chapters.length);\n\n        await (0,_utils_delay_js__WEBPACK_IMPORTED_MODULE_4__.delay)(800 + Math.random() * 700);\n\n        let { title: chTitle, xhtml } = await (0,_core_getChapter_js__WEBPACK_IMPORTED_MODULE_3__.getChapter)(chapter.href);\n\n        tocEntries.push({\n            id: `ch${chapterIndex}`,\n            title: chTitle\n        });\n\n        fb2Chapters += `\n<section id=\"ch${chapterIndex}\">\n    <title><p>${chTitle}</p></title>\n    ${xhtml}\n</section>`;\n\n        chapterIndex++;\n    }\n\n    // ---------- TOC ----------\n    let fb2Toc = (0,_fb2Toc_js__WEBPACK_IMPORTED_MODULE_7__.buildFb2Toc)(tocEntries);\n\n    // ---------- BODY ----------\n    let fb2Body = (0,_fb2Body_js__WEBPACK_IMPORTED_MODULE_8__.buildFb2Body)(fb2Chapters);\n\n    const baseName = (0,_utils_generateFileName_js__WEBPACK_IMPORTED_MODULE_5__.generateFileBaseName)(mainAuthor.name, title);\n    const fileName = `${baseName}.fb2`;\n\n    let blob = new Blob([fb2Header + fb2Toc + fb2Body], { type: \"application/xml\" });\n    let link = document.createElement(\"a\");\n    link.href = URL.createObjectURL(blob);\n    link.download = fileName;\n    link.click();\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/fb2/fb2Builder.js?\n}");

/***/ },

/***/ "./src/fb2/fb2Header.js"
/*!******************************!*\
  !*** ./src/fb2/fb2Header.js ***!
  \******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildFb2Header: () => (/* binding */ buildFb2Header)\n/* harmony export */ });\n/* harmony import */ var _utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/escapeXml.js */ \"./src/utils/escapeXml.js\");\n/* harmony import */ var _utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/textToParagraphs.js */ \"./src/utils/textToParagraphs.js\");\n\n\n\nfunction buildFb2Header({\n                                   title,\n                                   mainAuthor,\n                                   coauthors,\n                                   direction,\n                                   rating,\n                                   size,\n                                   status,\n                                   tags,\n                                   description,\n                                   notes,\n                                   otherPublication,\n                                   fandom\n                               }) {\n    return `<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<FictionBook xmlns=\"http://www.gribuser.ru/xml/fictionbook/2.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n    <stylesheet type=\"text/css\">\n        .body{font-family : Verdana, Geneva, Arial, Helvetica, sans-serif;}\n        .p{margin:0.5em 0 0 0.3em; padding:0.2em; text-align:justify;}\n    </stylesheet>\n    <description>\n        <title-info>\n\n            <author>\n                <username>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)}</username>\n                <first-name>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)}</first-name>\n                <home-page>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.url)}</home-page>\n            </author>\n\n            <book-title>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</book-title>\n\n            <annotation>\n                <p><strong>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</strong> (${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(location.href)})</p>\n                <p><strong>Направленность:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(direction)}</p>\n                <p><strong>Автор:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)} (${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.url)})</p>\n                ${coauthors ? `<p><strong>Соавторы:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(coauthors)}</p>` : \"\"}\n                <p><strong>Фэндом:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(fandom || \"\")}</p>\n                <p><strong>Рейтинг:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(rating)}</p>\n                <p><strong>Размер:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(size)} слов</p>\n                <p><strong>Статус:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(status)}</p>\n                <p><strong>Метки:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(tags || \"\")}</p>\n                <p><strong>Описание:</strong></p>\n                ${(0,_utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__.textToParagraphs)(description)}\n                <p><strong>Примечания:</strong></p>\n                ${(0,_utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__.textToParagraphs)(notes)}\n                <p><strong>Публикация на других ресурсах:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(otherPublication || \"\")}</p>\n            </annotation>\n\n            <date value=\"${new Date().toISOString().split(\"T\")[0]}\">${new Date().toLocaleDateString()}</date>\n            <lang>ru</lang>\n\n        </title-info>\n\n        <document-info>\n            <program-used>https://ficbook.net</program-used>\n            <date value=\"${new Date().toISOString()}\">${new Date().toLocaleString()}</date>\n            <src-url>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(location.href)}</src-url>\n            <id>${Date.now()}</id>\n        </document-info>\n    </description>\n`;\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/fb2/fb2Header.js?\n}");

/***/ },

/***/ "./src/fb2/fb2Toc.js"
/*!***************************!*\
  !*** ./src/fb2/fb2Toc.js ***!
  \***************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildFb2Toc: () => (/* binding */ buildFb2Toc)\n/* harmony export */ });\nfunction buildFb2Toc(tocEntries) {\n    return `\n<body name=\"toc\">\n    <section>\n        <title><p>Оглавление</p></title>\n        ${tocEntries.map(ch => `\n        <p><a xlink:href=\"#${ch.id}\">${ch.title}</a></p>\n        `).join(\"\")}\n    </section>\n</body>\n`;\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/fb2/fb2Toc.js?\n}");

/***/ },

/***/ "./src/main.js"
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _fb2_fb2Builder_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fb2/fb2Builder.js */ \"./src/fb2/fb2Builder.js\");\n/* harmony import */ var _epub_epubBuilder_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./epub/epubBuilder.js */ \"./src/epub/epubBuilder.js\");\n/* harmony import */ var _ui_buttons_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ui/buttons.js */ \"./src/ui/buttons.js\");\n\n\n\n\nwindow.addEventListener(\"load\", () => {\n    (0,_ui_buttons_js__WEBPACK_IMPORTED_MODULE_2__.createButtons)(_fb2_fb2Builder_js__WEBPACK_IMPORTED_MODULE_0__.createFB2, _epub_epubBuilder_js__WEBPACK_IMPORTED_MODULE_1__.createEPUB);\n});\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/main.js?\n}");

/***/ },

/***/ "./src/ui/buttons.js"
/*!***************************!*\
  !*** ./src/ui/buttons.js ***!
  \***************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createButtons: () => (/* binding */ createButtons)\n/* harmony export */ });\nfunction createButtons(createFB2, createEPUB) {\n    const container = document.createElement(\"div\");\n    container.style.position = \"fixed\";\n    container.style.bottom = \"20px\";\n    container.style.right = \"20px\";\n    container.style.zIndex = \"10000\";\n    container.style.display = \"flex\";\n    container.style.flexDirection = \"column\";\n    container.style.gap = \"8px\";\n\n    function createButton(label, bgColor) {\n        const btn = document.createElement(\"button\");\n        btn.textContent = label;\n        btn.style.padding = \"8px 12px\";\n        btn.style.borderRadius = \"999px\";\n        btn.style.border = \"none\";\n        btn.style.cursor = \"pointer\";\n        btn.style.background = bgColor;\n        btn.style.color = \"#fff\";\n        btn.style.fontSize = \"13px\";\n        btn.style.fontWeight = \"600\";\n        btn.style.opacity = \"0.9\";\n        btn.style.transition = \"opacity 0.15s ease, transform 0.1s ease\";\n        return btn;\n    }\n\n    const fb2Btn = createButton(\"Скачать FB2\", \"#3b82f6\");\n    const epubBtn = createButton(\"Скачать EPUB\", \"#16a34a\");\n\n    fb2Btn.onclick = () => {\n        fb2Btn.disabled = true;\n\n        createFB2((current, total) => {\n            fb2Btn.textContent = `FB2: ${current} / ${total}`;\n        }).finally(() => {\n            fb2Btn.textContent = \"Скачать FB2\";\n            fb2Btn.disabled = false;\n        });\n    };\n\n    epubBtn.onclick = () => {\n        epubBtn.disabled = true;\n\n        createEPUB((current, total) => {\n            epubBtn.textContent = `EPUB: ${current} / ${total}`;\n        }).finally(() => {\n            epubBtn.textContent = \"Скачать EPUB\";\n            epubBtn.disabled = false;\n        });\n    };\n\n    container.appendChild(fb2Btn);\n    container.appendChild(epubBtn);\n    document.body.appendChild(container);\n}\n\n//testtestt\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/ui/buttons.js?\n}");

/***/ },

/***/ "./src/utils/delay.js"
/*!****************************!*\
  !*** ./src/utils/delay.js ***!
  \****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   delay: () => (/* binding */ delay)\n/* harmony export */ });\nfunction delay(ms) {\n    return new Promise(resolve => setTimeout(resolve, ms));\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/utils/delay.js?\n}");

/***/ },

/***/ "./src/utils/escapeXml.js"
/*!********************************!*\
  !*** ./src/utils/escapeXml.js ***!
  \********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   escapeXml: () => (/* binding */ escapeXml)\n/* harmony export */ });\nfunction escapeXml(str) {\n    return str\n        .replace(/&/g, \"&amp;\")\n        .replace(/</g, \"&lt;\")\n        .replace(/>/g, \"&gt;\")\n        .replace(/\"/g, \"&quot;\")\n        .replace(/'/g, \"&apos;\");\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/utils/escapeXml.js?\n}");

/***/ },

/***/ "./src/utils/generateFileName.js"
/*!***************************************!*\
  !*** ./src/utils/generateFileName.js ***!
  \***************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   generateFileBaseName: () => (/* binding */ generateFileBaseName),\n/* harmony export */   sanitizeFilePart: () => (/* binding */ sanitizeFilePart)\n/* harmony export */ });\nfunction sanitizeFilePart(str) {\n    return str.replace(/\\s+/g, \"_\").replace(/[\\\\/:*?\"<>|]+/g, \"\");\n}\n\nfunction generateFileBaseName(mainAuthorName, title) {\n    return `${sanitizeFilePart(mainAuthorName)}-_-${sanitizeFilePart(title)}`;\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/utils/generateFileName.js?\n}");

/***/ },

/***/ "./src/utils/textToParagraphs.js"
/*!***************************************!*\
  !*** ./src/utils/textToParagraphs.js ***!
  \***************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   textToParagraphs: () => (/* binding */ textToParagraphs)\n/* harmony export */ });\n/* harmony import */ var _escapeXml_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./escapeXml.js */ \"./src/utils/escapeXml.js\");\n\n\nfunction textToParagraphs(text) {\n    return text.split(/\\n+/)\n        .map(line => line.trim())\n        .filter(line => line.length > 0)\n        .map(line => `<p>${(0,_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(line)}</p>`)\n        .join(\"\\n\");\n}\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/utils/textToParagraphs.js?\n}");

/***/ }

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Check if module exists (development only)
/******/ 	if (__webpack_modules__[moduleId] === undefined) {
/******/ 		var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 		e.code = 'MODULE_NOT_FOUND';
/******/ 		throw e;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module can't be inlined because the eval devtool is used.
/******/ var __webpack_exports__ = __webpack_require__("./src/main.js");
/******/ 
