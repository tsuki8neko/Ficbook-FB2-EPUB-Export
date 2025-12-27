// ==UserScript==
// @name         Ficbook FB2 & EPUB Export
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Ficbook FB2 & EPUB Export
// @author       Moon Cat
// @match        https://ficbook.net/readfic/*
// @grant        none
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

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getAuthors: () => (/* binding */ getAuthors)\n/* harmony export */ });\nfunction getAuthors() {\r\n    const hat = document.querySelector(\".fanfic-hat-body\");\r\n    const authorsNodes = hat.querySelectorAll(\".creator-info .creator-username\");\r\n    return Array.from(authorsNodes).map(a => ({\r\n        name: a.innerText.trim(),\r\n        url: a.href\r\n    }));\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/core/getAuthors.js?\n}");

/***/ },

/***/ "./src/core/getChapter.js"
/*!********************************!*\
  !*** ./src/core/getChapter.js ***!
  \********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getChapter: () => (/* binding */ getChapter)\n/* harmony export */ });\n/* harmony import */ var _utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/textToParagraphs.js */ \"./src/utils/textToParagraphs.js\");\n\r\n\r\nasync function getChapter(url) {\r\n    let res = await fetch(url);\r\n    let html = await res.text();\r\n    let doc = new DOMParser().parseFromString(html, \"text/html\");\r\n\r\n    let title = doc.querySelector(\".title-area h2, .part-title h3\")?.innerText.trim() || \"Глава\";\r\n\r\n    let contentNode = doc.querySelector(\"#part_content\");\r\n    if (contentNode) {\r\n        contentNode.querySelectorAll(\r\n            \".js-collapsible, .js-text-settings-collapse-button, .ad, .part-footer, .chapter-time, .text_settings, .tags\"\r\n        ).forEach(el => el.remove());\r\n\r\n        contentNode.querySelector(\"h1, h2, h3\")?.remove();\r\n    }\r\n\r\n    let content = contentNode ? contentNode.innerText : \"\";\r\n\r\n    return {\r\n        title,\r\n        plain: content.trim(),\r\n        xhtml: (0,_utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_0__.textToParagraphs)(content)\r\n    };\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/core/getChapter.js?\n}");

/***/ },

/***/ "./src/core/getMeta.js"
/*!*****************************!*\
  !*** ./src/core/getMeta.js ***!
  \*****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getDirectionRatingStatus: () => (/* binding */ getDirectionRatingStatus),\n/* harmony export */   getExtraData: () => (/* binding */ getExtraData)\n/* harmony export */ });\nfunction getExtraData() {\r\n    const findBlock = (label) =>\r\n        Array.from(document.querySelectorAll(\".description .mb-10\"))\r\n            .find(n => n.querySelector(\"strong\")?.innerText.includes(label));\r\n\r\n    const fandomBlock = findBlock(\"Фэндом:\");\r\n    const fandom = fandomBlock\r\n        ? Array.from(fandomBlock.querySelectorAll(\"a\")).map(a => a.innerText.trim()).join(\", \")\r\n        : \"\";\r\n\r\n    const sizeBlock = findBlock(\"Размер:\");\r\n    let size = \"\";\r\n    if (sizeBlock) {\r\n        const match = sizeBlock.innerText.match(/(\\d[\\d\\s]*\\d)\\s*слов/);\r\n        size = match ? match[1] : \"\";\r\n    }\r\n\r\n    const tagsNode = document.querySelector(\".description .tags\");\r\n    const tags = tagsNode\r\n        ? Array.from(tagsNode.querySelectorAll(\"a\")).map(a => a.innerText.trim()).join(\", \")\r\n        : \"\";\r\n\r\n    const description = document.querySelector(\".description .js-public-beta-description\")?.innerText.trim() || \"\";\r\n    const notes = document.querySelector(\".description .js-public-beta-author-comment\")?.innerText.trim() || \"\";\r\n\r\n    const otherPublicationBlock = findBlock(\"Публикация на других ресурсах:\");\r\n    const otherPublication = otherPublicationBlock\r\n        ? otherPublicationBlock.innerText.trim()\r\n        : \"\";\r\n\r\n    return { fandom, size, tags, description, notes, otherPublication };\r\n}\r\n\r\nfunction getDirectionRatingStatus() {\r\n    const direction = document.querySelector(\".fanfic-badges .badge-with-icon.direction .badge-text\")?.innerText.trim() || \"\";\r\n    const rating = document.querySelector(\".fanfic-badges .badge-with-icon[class*='badge-rating'] .badge-text\")?.innerText.trim() || \"\";\r\n    const status = document.querySelector(\".fanfic-badges .badge-with-icon[class*='badge-status'] .badge-text\")?.innerText.trim() || \"\";\r\n    return { direction, rating, status };\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/core/getMeta.js?\n}");

/***/ },

/***/ "./src/core/getTitle.js"
/*!******************************!*\
  !*** ./src/core/getTitle.js ***!
  \******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getTitle: () => (/* binding */ getTitle)\n/* harmony export */ });\nfunction getTitle() {\r\n    return document.querySelector(\"h1.heading[itemprop='name']\")?.innerText.trim() || \"Фанфик\";\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/core/getTitle.js?\n}");

/***/ },

/***/ "./src/epub/epubBuilder.js"
/*!*********************************!*\
  !*** ./src/epub/epubBuilder.js ***!
  \*********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createEPUB: () => (/* binding */ createEPUB)\n/* harmony export */ });\n/* harmony import */ var _core_getTitle_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/getTitle.js */ \"./src/core/getTitle.js\");\n/* harmony import */ var _core_getAuthors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/getAuthors.js */ \"./src/core/getAuthors.js\");\n/* harmony import */ var _core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/getMeta.js */ \"./src/core/getMeta.js\");\n/* harmony import */ var _core_getChapter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/getChapter.js */ \"./src/core/getChapter.js\");\n/* harmony import */ var _utils_generateFileName_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/generateFileName.js */ \"./src/utils/generateFileName.js\");\n/* harmony import */ var _epubCss_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./epubCss.js */ \"./src/epub/epubCss.js\");\n/* harmony import */ var _epubTemplates_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./epubTemplates.js */ \"./src/epub/epubTemplates.js\");\n/* harmony import */ var _epubOpf_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./epubOpf.js */ \"./src/epub/epubOpf.js\");\n/* harmony import */ var _epubNcx_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./epubNcx.js */ \"./src/epub/epubNcx.js\");\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\nasync function createEPUB() {\r\n    // JSZip loader\r\n    if (!window.JSZip) {\r\n        await new Promise((resolve, reject) => {\r\n            const s = document.createElement(\"script\");\r\n            s.src = \"https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js\";\r\n            s.onload = resolve;\r\n            s.onerror = () => reject(new Error(\"Не удалось загрузить JSZip\"));\r\n            document.head.appendChild(s);\r\n        });\r\n    }\r\n\r\n    const title = (0,_core_getTitle_js__WEBPACK_IMPORTED_MODULE_0__.getTitle)();\r\n    const authors = (0,_core_getAuthors_js__WEBPACK_IMPORTED_MODULE_1__.getAuthors)();\r\n    if (!authors.length) {\r\n        alert(\"Авторы не найдены, возможно, изменился HTML Ficbook.\");\r\n        return;\r\n    }\r\n    const mainAuthor = authors[0];\r\n    const coauthors = authors.slice(1).map(a => a.name).join(\", \");\r\n\r\n    const { fandom, size, tags, description, notes, otherPublication } = (0,_core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__.getExtraData)();\r\n    const { direction, rating, status } = (0,_core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__.getDirectionRatingStatus)();\r\n\r\n    // ---------- СБОР ГЛАВ ----------\r\n    const chaptersNodes = document.querySelectorAll(\".list-of-fanfic-parts .part-link\");\r\n    const chapters = [];\r\n    let index = 1;\r\n\r\n    for (let chapter of chaptersNodes) {\r\n        let { title: chTitle, xhtml } = await (0,_core_getChapter_js__WEBPACK_IMPORTED_MODULE_3__.getChapter)(chapter.href);\r\n        chapters.push({\r\n            id: `chapter${index}`,\r\n            file: `chapter${index}.xhtml`,\r\n            title: chTitle,\r\n            content: xhtml\r\n        });\r\n        index++;\r\n    }\r\n\r\n    const zip = new JSZip();\r\n\r\n    // mimetype\r\n    zip.file(\"mimetype\", \"application/epub+zip\", { compression: \"STORE\" });\r\n\r\n    // META-INF/container.xml\r\n    zip.file(\"META-INF/container.xml\", `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n<container version=\"1.0\"\r\n    xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\r\n    <rootfiles>\r\n        <rootfile full-path=\"OEBPS/content.opf\"\r\n            media-type=\"application/oebps-package+xml\"/>\r\n    </rootfiles>\r\n</container>`);\r\n\r\n    // CSS\r\n    zip.file(\"OEBPS/style.css\", _epubCss_js__WEBPACK_IMPORTED_MODULE_5__.epubCss.trim());\r\n\r\n    // Title page\r\n    zip.file(\"OEBPS/titlepage.xhtml\", (0,_epubTemplates_js__WEBPACK_IMPORTED_MODULE_6__.buildTitlePage)({\r\n        title,\r\n        mainAuthor,\r\n        coauthors,\r\n        direction,\r\n        rating,\r\n        size,\r\n        status,\r\n        tags,\r\n        description,\r\n        notes,\r\n        otherPublication\r\n    }));\r\n\r\n    // Chapters\r\n    chapters.forEach(ch => {\r\n        zip.file(`OEBPS/${ch.file}`, (0,_epubTemplates_js__WEBPACK_IMPORTED_MODULE_6__.buildChapterPage)(ch));\r\n    });\r\n\r\n    // TOC XHTML\r\n    zip.file(\"OEBPS/toc.xhtml\", (0,_epubTemplates_js__WEBPACK_IMPORTED_MODULE_6__.buildTocXhtml)(chapters));\r\n\r\n    // content.opf\r\n    zip.file(\"OEBPS/content.opf\", (0,_epubOpf_js__WEBPACK_IMPORTED_MODULE_7__.buildOpf)({\r\n        title,\r\n        mainAuthor,\r\n        description,\r\n        chapters\r\n    }));\r\n\r\n    // toc.ncx\r\n    zip.file(\"OEBPS/toc.ncx\", (0,_epubNcx_js__WEBPACK_IMPORTED_MODULE_8__.buildNcx)(title, chapters));\r\n\r\n    // ---------- Генерация EPUB ----------\r\n    const baseName = (0,_utils_generateFileName_js__WEBPACK_IMPORTED_MODULE_4__.generateFileBaseName)(mainAuthor.name, title);\r\n    const fileName = `${baseName}.epub`;\r\n\r\n    const blob = await zip.generateAsync({ type: \"blob\" });\r\n    const link = document.createElement(\"a\");\r\n    link.href = URL.createObjectURL(blob);\r\n    link.download = fileName;\r\n    link.click();\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/epub/epubBuilder.js?\n}");

/***/ },

/***/ "./src/epub/epubCss.js"
/*!*****************************!*\
  !*** ./src/epub/epubCss.js ***!
  \*****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   epubCss: () => (/* binding */ epubCss)\n/* harmony export */ });\nconst epubCss = `\r\nbody {\r\n    margin: 0;\r\n    padding: 0 8%;\r\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;\r\n    line-height: 1.6;\r\n    font-size: 1em;\r\n}\r\nh1, h2, h3 {\r\n    font-weight: 600;\r\n    margin: 1.2em 0 0.6em;\r\n}\r\nh1 {\r\n    font-size: 1.6em;\r\n    text-align: center;\r\n}\r\np {\r\n    margin: 0.6em 0;\r\n}\r\nstrong {\r\n    font-weight: 600;\r\n}\r\n.title-page {\r\n    margin-top: 20%;\r\n    text-align: center;\r\n}\r\n.title-page h1 {\r\n    font-size: 1.8em;\r\n    margin-bottom: 0.4em;\r\n}\r\n.title-page h2 {\r\n    font-size: 1.2em;\r\n    margin-top: 0;\r\n    color: #555;\r\n}\r\n.meta-block {\r\n    margin-top: 2em;\r\n    font-size: 0.9em;\r\n    color: #555;\r\n}\r\n.meta-block p {\r\n    margin: 0.2em 0;\r\n}\r\n`;\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/epub/epubCss.js?\n}");

/***/ },

/***/ "./src/epub/epubNcx.js"
/*!*****************************!*\
  !*** ./src/epub/epubNcx.js ***!
  \*****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildNcx: () => (/* binding */ buildNcx)\n/* harmony export */ });\n/* harmony import */ var _utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/escapeXml.js */ \"./src/utils/escapeXml.js\");\n\r\n\r\nfunction buildNcx(title, chapters) {\r\n    const navPoints = chapters.map((ch, i) => `\r\n        <navPoint id=\"navPoint-${i + 3}\" playOrder=\"${i + 3}\">\r\n            <navLabel><text>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(ch.title)}</text></navLabel>\r\n            <content src=\"${ch.file}\"/>\r\n        </navPoint>\r\n    `).join(\"\\n\");\r\n\r\n    return `\r\n<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\"\r\n    version=\"2005-1\">\r\n    <head>\r\n        <meta name=\"dtb:uid\" content=\"urn:uuid:${Date.now()}\"/>\r\n        <meta name=\"dtb:depth\" content=\"1\"/>\r\n        <meta name=\"dtb:totalPageCount\" content=\"0\"/>\r\n        <meta name=\"dtb:maxPageNumber\" content=\"0\"/>\r\n    </head>\r\n    <docTitle>\r\n        <text>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</text>\r\n    </docTitle>\r\n    <navMap>\r\n        <navPoint id=\"navPoint-1\" playOrder=\"1\">\r\n            <navLabel><text>Титульная страница</text></navLabel>\r\n            <content src=\"titlepage.xhtml\"/>\r\n        </navPoint>\r\n        <navPoint id=\"navPoint-2\" playOrder=\"2\">\r\n            <navLabel><text>Оглавление</text></navLabel>\r\n            <content src=\"toc.xhtml\"/>\r\n        </navPoint>\r\n        ${navPoints}\r\n    </navMap>\r\n</ncx>\r\n`.trim();\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/epub/epubNcx.js?\n}");

/***/ },

/***/ "./src/epub/epubOpf.js"
/*!*****************************!*\
  !*** ./src/epub/epubOpf.js ***!
  \*****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildOpf: () => (/* binding */ buildOpf)\n/* harmony export */ });\n/* harmony import */ var _utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/escapeXml.js */ \"./src/utils/escapeXml.js\");\n\r\n\r\nfunction buildOpf({ title, mainAuthor, description, chapters }) {\r\n    const now = new Date();\r\n    const isoDate = now.toISOString().split(\"T\")[0];\r\n\r\n    const manifest = [\r\n        `<item id=\"css\" href=\"style.css\" media-type=\"text/css\"/>`,\r\n        `<item id=\"titlepage\" href=\"titlepage.xhtml\" media-type=\"application/xhtml+xml\"/>`,\r\n        `<item id=\"toc\" href=\"toc.xhtml\" media-type=\"application/xhtml+xml\"/>`,\r\n        ...chapters.map(ch =>\r\n            `<item id=\"${ch.id}\" href=\"${ch.file}\" media-type=\"application/xhtml+xml\"/>`\r\n        ),\r\n        `<item id=\"ncx\" href=\"toc.ncx\" media-type=\"application/x-dtbncx+xml\"/>`\r\n    ].join(\"\\n        \");\r\n\r\n    const spine = [\r\n        `<itemref idref=\"titlepage\"/>`,\r\n        `<itemref idref=\"toc\"/>`,\r\n        ...chapters.map(ch => `<itemref idref=\"${ch.id}\"/>`)\r\n    ].join(\"\\n        \");\r\n\r\n    return `\r\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<package version=\"2.0\"\r\n    xmlns=\"http://www.idpf.org/2007/opf\"\r\n    unique-identifier=\"BookId\">\r\n\r\n        <metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\r\n            <dc:title>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</dc:title>\r\n            <dc:creator>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)}</dc:creator>\r\n            <dc:language>ru</dc:language>\r\n            <dc:identifier id=\"BookId\">urn:uuid:${Date.now()}</dc:identifier>\r\n            <dc:date>${isoDate}</dc:date>\r\n            <dc:subject>fiction</dc:subject>\r\n            <dc:description>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(description.slice(0, 500))}</dc:description>\r\n            <meta name=\"source\" content=\"${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(location.href)}\"/>\r\n        </metadata>\r\n        <manifest>\r\n            ${manifest}\r\n        </manifest>\r\n        <spine toc=\"ncx\">\r\n            ${spine}\r\n        </spine>\r\n    </package>\r\n`.trim();\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/epub/epubOpf.js?\n}");

/***/ },

/***/ "./src/epub/epubTemplates.js"
/*!***********************************!*\
  !*** ./src/epub/epubTemplates.js ***!
  \***********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildChapterPage: () => (/* binding */ buildChapterPage),\n/* harmony export */   buildTitlePage: () => (/* binding */ buildTitlePage),\n/* harmony export */   buildTocXhtml: () => (/* binding */ buildTocXhtml)\n/* harmony export */ });\n/* harmony import */ var _utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/escapeXml.js */ \"./src/utils/escapeXml.js\");\n/* harmony import */ var _utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/textToParagraphs.js */ \"./src/utils/textToParagraphs.js\");\n\r\n\r\n\r\nfunction buildTitlePage({\r\n                                   title,\r\n                                   mainAuthor,\r\n                                   coauthors,\r\n                                   direction,\r\n                                   rating,\r\n                                   size,\r\n                                   status,\r\n                                   tags,\r\n                                   description,\r\n                                   notes,\r\n                                   otherPublication,\r\n                                   fandom\r\n                               }) {\r\n    return `\r\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"ru\">\r\n<head>\r\n    <title>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</title>\r\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\"/>\r\n</head>\r\n<body>\r\n    <div class=\"title-page\">\r\n        <h1>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</h1>\r\n        <h2>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)}</h2>\r\n        <div class=\"meta-block\">\r\n            <p><strong>Направленность:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(direction)}</p>\r\n            <p><strong>Автор:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)}</p>\r\n            ${coauthors ? `<p><strong>Соавторы:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(coauthors)}</p>` : \"\"}\r\n            <p><strong>Фэндом:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(fandom)}</p>\r\n            <p><strong>Рейтинг:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(rating)}</p>\r\n            <p><strong>Размер:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(size)} слов</p>\r\n            <p><strong>Статус:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(status)}</p>\r\n            <p><strong>Метки:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(tags)}</p>\r\n            <p><strong>Ссылка на оригинал:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(location.href)}</p>\r\n        </div>\r\n    </div>\r\n\r\n    <h2>Описание</h2>\r\n    ${(0,_utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__.textToParagraphs)(description)}\r\n\r\n    ${notes ? `<h2>Примечания</h2>\\n${(0,_utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__.textToParagraphs)(notes)}` : \"\"}\r\n\r\n    ${otherPublication ? `<h2>Публикация на других ресурсах</h2>\\n<p>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(otherPublication)}</p>` : \"\"}\r\n\r\n</body>\r\n</html>\r\n`.trim();\r\n}\r\n\r\nfunction buildChapterPage(ch) {\r\n    return `\r\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"ru\">\r\n<head>\r\n    <title>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(ch.title)}</title>\r\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\"/>\r\n</head>\r\n<body>\r\n    <h1>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(ch.title)}</h1>\r\n    ${ch.content}\r\n</body>\r\n</html>\r\n`.trim();\r\n}\r\n\r\nfunction buildTocXhtml(chapters) {\r\n    const tocItems = chapters.map(ch => `\r\n        <li><a href=\"${ch.file}\">${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(ch.title)}</a></li>\r\n    `).join(\"\\n\");\r\n\r\n    return `\r\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"ru\">\r\n<head>\r\n    <title>Оглавление</title>\r\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\"/>\r\n</head>\r\n<body>\r\n    <h1>Оглавление</h1>\r\n    <ol>\r\n        <li><a href=\"titlepage.xhtml\">Титульная страница</a></li>\r\n        ${tocItems}\r\n    </ol>\r\n</body>\r\n</html>\r\n`.trim();\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/epub/epubTemplates.js?\n}");

/***/ },

/***/ "./src/fb2/fb2Body.js"
/*!****************************!*\
  !*** ./src/fb2/fb2Body.js ***!
  \****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildFb2Body: () => (/* binding */ buildFb2Body)\n/* harmony export */ });\nfunction buildFb2Body(fb2Chapters) {\r\n    return `\r\n<body>\r\n${fb2Chapters}\r\n</body>\r\n</FictionBook>\r\n`;\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/fb2/fb2Body.js?\n}");

/***/ },

/***/ "./src/fb2/fb2Builder.js"
/*!*******************************!*\
  !*** ./src/fb2/fb2Builder.js ***!
  \*******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createFB2: () => (/* binding */ createFB2)\n/* harmony export */ });\n/* harmony import */ var _core_getTitle_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/getTitle.js */ \"./src/core/getTitle.js\");\n/* harmony import */ var _core_getAuthors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/getAuthors.js */ \"./src/core/getAuthors.js\");\n/* harmony import */ var _core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/getMeta.js */ \"./src/core/getMeta.js\");\n/* harmony import */ var _core_getChapter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/getChapter.js */ \"./src/core/getChapter.js\");\n/* harmony import */ var _utils_delay_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/delay.js */ \"./src/utils/delay.js\");\n/* harmony import */ var _utils_generateFileName_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/generateFileName.js */ \"./src/utils/generateFileName.js\");\n/* harmony import */ var _fb2Header_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./fb2Header.js */ \"./src/fb2/fb2Header.js\");\n/* harmony import */ var _fb2Toc_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./fb2Toc.js */ \"./src/fb2/fb2Toc.js\");\n/* harmony import */ var _fb2Body_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./fb2Body.js */ \"./src/fb2/fb2Body.js\");\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\nasync function createFB2() {\r\n    const title = (0,_core_getTitle_js__WEBPACK_IMPORTED_MODULE_0__.getTitle)();\r\n    const authors = (0,_core_getAuthors_js__WEBPACK_IMPORTED_MODULE_1__.getAuthors)();\r\n    if (!authors.length) {\r\n        alert(\"Авторы не найдены, возможно, изменился HTML Ficbook.\");\r\n        return;\r\n    }\r\n    const mainAuthor = authors[0];\r\n    const coauthors = authors.slice(1).map(a => a.name).join(\", \");\r\n\r\n    const { fandom, size, tags, description, notes, otherPublication } = (0,_core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__.getExtraData)();\r\n    const { direction, rating, status } = (0,_core_getMeta_js__WEBPACK_IMPORTED_MODULE_2__.getDirectionRatingStatus)();\r\n\r\n    // ---------- HEADER ----------\r\n    let fb2Header = (0,_fb2Header_js__WEBPACK_IMPORTED_MODULE_6__.buildFb2Header)({\r\n        title,\r\n        mainAuthor,\r\n        coauthors,\r\n        direction,\r\n        rating,\r\n        size,\r\n        status,\r\n        tags,\r\n        description,\r\n        notes,\r\n        otherPublication\r\n    });\r\n\r\n    // ---------- СБОР ГЛАВ ----------\r\n    let fb2Chapters = \"\";\r\n    let tocEntries = [];\r\n    let chapterIndex = 1;\r\n\r\n    let rawChapters = Array.from(document.querySelectorAll(\".list-of-fanfic-parts .part-link\"))\r\n        .filter(ch => {\r\n            if (!ch.href) return false;\r\n            if (ch.href.includes(\"/all-parts\")) return false;\r\n            let clean = ch.href.split(\"#\")[0];\r\n            let last = clean.split(\"/\").pop();\r\n            return /^\\d+$/.test(last);\r\n        });\r\n\r\n    let chapters = [];\r\n    let seen = new Set();\r\n    for (let ch of rawChapters) {\r\n        if (!seen.has(ch.href)) {\r\n            seen.add(ch.href);\r\n            chapters.push(ch);\r\n        }\r\n    }\r\n\r\n    for (let chapter of chapters) {\r\n        await (0,_utils_delay_js__WEBPACK_IMPORTED_MODULE_4__.delay)(800 + Math.random() * 700);\r\n\r\n        let { title: chTitle, xhtml } = await (0,_core_getChapter_js__WEBPACK_IMPORTED_MODULE_3__.getChapter)(chapter.href);\r\n\r\n        tocEntries.push({\r\n            id: `ch${chapterIndex}`,\r\n            title: chTitle\r\n        });\r\n\r\n        fb2Chapters += `\r\n<section id=\"ch${chapterIndex}\">\r\n    <title><p>${chTitle}</p></title>\r\n    ${xhtml}\r\n</section>`;\r\n\r\n        chapterIndex++;\r\n    }\r\n\r\n    // ---------- TOC ----------\r\n    let fb2Toc = (0,_fb2Toc_js__WEBPACK_IMPORTED_MODULE_7__.buildFb2Toc)(tocEntries);\r\n\r\n    // ---------- BODY ----------\r\n    let fb2Body = (0,_fb2Body_js__WEBPACK_IMPORTED_MODULE_8__.buildFb2Body)(fb2Chapters);\r\n\r\n    const baseName = (0,_utils_generateFileName_js__WEBPACK_IMPORTED_MODULE_5__.generateFileBaseName)(mainAuthor.name, title);\r\n    const fileName = `${baseName}.fb2`;\r\n\r\n    let blob = new Blob([fb2Header + fb2Toc + fb2Body], { type: \"application/xml\" });\r\n    let link = document.createElement(\"a\");\r\n    link.href = URL.createObjectURL(blob);\r\n    link.download = fileName;\r\n    link.click();\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/fb2/fb2Builder.js?\n}");

/***/ },

/***/ "./src/fb2/fb2Header.js"
/*!******************************!*\
  !*** ./src/fb2/fb2Header.js ***!
  \******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildFb2Header: () => (/* binding */ buildFb2Header)\n/* harmony export */ });\n/* harmony import */ var _utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/escapeXml.js */ \"./src/utils/escapeXml.js\");\n/* harmony import */ var _utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/textToParagraphs.js */ \"./src/utils/textToParagraphs.js\");\n\r\n\r\n\r\nfunction buildFb2Header({\r\n                                   title,\r\n                                   mainAuthor,\r\n                                   coauthors,\r\n                                   direction,\r\n                                   rating,\r\n                                   size,\r\n                                   status,\r\n                                   tags,\r\n                                   description,\r\n                                   notes,\r\n                                   otherPublication,\r\n                                   fandom\r\n                               }) {\r\n    return `<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<FictionBook xmlns=\"http://www.gribuser.ru/xml/fictionbook/2.0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\r\n    <stylesheet type=\"text/css\">\r\n        .body{font-family : Verdana, Geneva, Arial, Helvetica, sans-serif;}\r\n        .p{margin:0.5em 0 0 0.3em; padding:0.2em; text-align:justify;}\r\n    </stylesheet>\r\n    <description>\r\n        <title-info>\r\n\r\n            <author>\r\n                <username>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)}</username>\r\n                <first-name>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)}</first-name>\r\n                <home-page>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.url)}</home-page>\r\n            </author>\r\n\r\n            <book-title>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</book-title>\r\n\r\n            <annotation>\r\n                <p><strong>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(title)}</strong> (${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(location.href)})</p>\r\n                <p><strong>Направленность:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(direction)}</p>\r\n                <p><strong>Автор:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.name)} (${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(mainAuthor.url)})</p>\r\n                ${coauthors ? `<p><strong>Соавторы:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(coauthors)}</p>` : \"\"}\r\n                <p><strong>Фэндом:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(fandom || \"\")}</p>\r\n                <p><strong>Рейтинг:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(rating)}</p>\r\n                <p><strong>Размер:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(size)} слов</p>\r\n                <p><strong>Статус:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(status)}</p>\r\n                <p><strong>Метки:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(tags || \"\")}</p>\r\n                <p><strong>Описание:</strong></p>\r\n                ${(0,_utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__.textToParagraphs)(description)}\r\n                <p><strong>Примечания:</strong></p>\r\n                ${(0,_utils_textToParagraphs_js__WEBPACK_IMPORTED_MODULE_1__.textToParagraphs)(notes)}\r\n                <p><strong>Публикация на других ресурсах:</strong> ${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(otherPublication || \"\")}</p>\r\n            </annotation>\r\n\r\n            <date value=\"${new Date().toISOString().split(\"T\")[0]}\">${new Date().toLocaleDateString()}</date>\r\n            <lang>ru</lang>\r\n\r\n        </title-info>\r\n\r\n        <document-info>\r\n            <program-used>https://ficbook.net</program-used>\r\n            <date value=\"${new Date().toISOString()}\">${new Date().toLocaleString()}</date>\r\n            <src-url>${(0,_utils_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(location.href)}</src-url>\r\n            <id>${Date.now()}</id>\r\n        </document-info>\r\n    </description>\r\n`;\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/fb2/fb2Header.js?\n}");

/***/ },

/***/ "./src/fb2/fb2Toc.js"
/*!***************************!*\
  !*** ./src/fb2/fb2Toc.js ***!
  \***************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   buildFb2Toc: () => (/* binding */ buildFb2Toc)\n/* harmony export */ });\nfunction buildFb2Toc(tocEntries) {\r\n    return `\r\n<body name=\"toc\">\r\n    <section>\r\n        <title><p>Оглавление</p></title>\r\n        ${tocEntries.map(ch => `\r\n        <p><a xlink:href=\"#${ch.id}\">${ch.title}</a></p>\r\n        `).join(\"\")}\r\n    </section>\r\n</body>\r\n`;\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/fb2/fb2Toc.js?\n}");

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

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createButtons: () => (/* binding */ createButtons)\n/* harmony export */ });\nfunction createButtons(createFB2, createEPUB) {\r\n    const container = document.createElement(\"div\");\r\n    container.style.position = \"fixed\";\r\n    container.style.bottom = \"20px\";\r\n    container.style.right = \"20px\";\r\n    container.style.zIndex = \"10000\";\r\n    container.style.display = \"flex\";\r\n    container.style.flexDirection = \"column\";\r\n    container.style.gap = \"8px\";\r\n\r\n    function createButton(label, bgColor, onClick) {\r\n        const btn = document.createElement(\"button\");\r\n        btn.textContent = label;\r\n        btn.style.padding = \"8px 12px\";\r\n        btn.style.borderRadius = \"999px\";\r\n        btn.style.border = \"none\";\r\n        btn.style.cursor = \"pointer\";\r\n        btn.style.background = bgColor;\r\n        btn.style.color = \"#fff\";\r\n        btn.style.boxShadow = \"0 2px 8px rgba(0,0,0,0.2)\";\r\n        btn.style.fontSize = \"13px\";\r\n        btn.style.fontWeight = \"600\";\r\n        btn.style.opacity = \"0.9\";\r\n        btn.style.transition = \"opacity 0.15s ease, transform 0.1s ease\";\r\n\r\n        btn.onmouseenter = () => {\r\n            btn.style.opacity = \"1\";\r\n            btn.style.transform = \"translateY(-1px)\";\r\n        };\r\n        btn.onmouseleave = () => {\r\n            btn.style.opacity = \"0.9\";\r\n            btn.style.transform = \"translateY(0)\";\r\n        };\r\n\r\n        btn.onclick = onClick;\r\n        return btn;\r\n    }\r\n\r\n    const fb2Btn = createButton(\"Скачать FB2\", \"#3b82f6\", () => {\r\n        createFB2().catch(err => {\r\n            console.error(err);\r\n            alert(\"Ошибка при создании FB2 (см. консоль).\");\r\n        });\r\n    });\r\n\r\n    const epubBtn = createButton(\"Скачать EPUB\", \"#16a34a\", () => {\r\n        createEPUB().catch(err => {\r\n            console.error(err);\r\n            alert(\"Ошибка при создании EPUB (см. консоль).\");\r\n        });\r\n    });\r\n\r\n    container.appendChild(fb2Btn);\r\n    container.appendChild(epubBtn);\r\n    document.body.appendChild(container);\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/ui/buttons.js?\n}");

/***/ },

/***/ "./src/utils/delay.js"
/*!****************************!*\
  !*** ./src/utils/delay.js ***!
  \****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   delay: () => (/* binding */ delay)\n/* harmony export */ });\nfunction delay(ms) {\r\n    return new Promise(resolve => setTimeout(resolve, ms));\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/utils/delay.js?\n}");

/***/ },

/***/ "./src/utils/escapeXml.js"
/*!********************************!*\
  !*** ./src/utils/escapeXml.js ***!
  \********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   escapeXml: () => (/* binding */ escapeXml)\n/* harmony export */ });\nfunction escapeXml(str) {\r\n    return str\r\n        .replace(/&/g, \"&amp;\")\r\n        .replace(/</g, \"&lt;\")\r\n        .replace(/>/g, \"&gt;\")\r\n        .replace(/\"/g, \"&quot;\")\r\n        .replace(/'/g, \"&apos;\");\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/utils/escapeXml.js?\n}");

/***/ },

/***/ "./src/utils/generateFileName.js"
/*!***************************************!*\
  !*** ./src/utils/generateFileName.js ***!
  \***************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   generateFileBaseName: () => (/* binding */ generateFileBaseName),\n/* harmony export */   sanitizeFilePart: () => (/* binding */ sanitizeFilePart)\n/* harmony export */ });\nfunction sanitizeFilePart(str) {\r\n    return str.replace(/\\s+/g, \"_\").replace(/[\\\\/:*?\"<>|]+/g, \"\");\r\n}\r\n\r\nfunction generateFileBaseName(mainAuthorName, title) {\r\n    return `${sanitizeFilePart(mainAuthorName)}-_-${sanitizeFilePart(title)}`;\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/utils/generateFileName.js?\n}");

/***/ },

/***/ "./src/utils/textToParagraphs.js"
/*!***************************************!*\
  !*** ./src/utils/textToParagraphs.js ***!
  \***************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   textToParagraphs: () => (/* binding */ textToParagraphs)\n/* harmony export */ });\n/* harmony import */ var _escapeXml_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./escapeXml.js */ \"./src/utils/escapeXml.js\");\n\r\n\r\nfunction textToParagraphs(text) {\r\n    return text.split(/\\n+/)\r\n        .map(line => line.trim())\r\n        .filter(line => line.length > 0)\r\n        .map(line => `<p>${(0,_escapeXml_js__WEBPACK_IMPORTED_MODULE_0__.escapeXml)(line)}</p>`)\r\n        .join(\"\\n\");\r\n}\r\n\n\n//# sourceURL=webpack://ficbook_fb2_epub_export/./src/utils/textToParagraphs.js?\n}");

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
