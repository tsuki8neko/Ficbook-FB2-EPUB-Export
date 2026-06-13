const fs = require("fs");
const path = require("path");
const pkg = require("./package.json");

module.exports = {
    entry: "./src/main.js",
    output: {
        filename: "ficbook-export.user.js",
        path: path.resolve(__dirname, "build"),
        module: true,
    },
    experiments: {
        outputModule: true,
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.js$/,
                type: "javascript/esm",
            }
        ]
    },
    optimization: {
        minimize: false
    },
    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.emit.tap("AddHeader", (compilation) => {
                    let header = fs.readFileSync("./tampermonkey-header.js", "utf8");

                    //  1. Подставляем версию из package.json
                    header = header.replace(
                        /^\/\/ @version\s+.*$/m,
                        `// @version     ${pkg.version}`
                    );

                    //  2. Формируем дату сборки
                    const now = new Date();
                    const buildDate = now.toISOString().replace("T", " ").substring(0, 16);

                    //  3. Добавляем @build сразу после @version
                    header = header.replace(
                        /(^\/\/ @version[^\n]*)/m,
                        `$1\n// @build       ${buildDate}`
                    );

                    //  4. Выравниваем все @ключи
                    const keys = [...new Set(
                        [...header.matchAll(/\/\/ @([^\s]+)\s+/g)]
                            .map(m => m[1])
                    )];

                    const maxLen = keys.length ? Math.max(...keys.map(k => k.length)) : 0;

                    header = header.replace(
                        /\/\/ @([^\s]+)\s+(.*)/g,
                        (match, key, value) => {
                            return `// @${key.padEnd(maxLen + 1, " ")}${value}`;
                        }
                    );

                    //  5. Склеиваем header + code
                    const file = compilation.assets["ficbook-export.user.js"];
                    const content = header + "\n" + file.source();

                    compilation.assets["ficbook-export.user.js"] = {
                        source: () => content,
                        size: () => content.length
                    };
                });
            }
        }
    ]
};
