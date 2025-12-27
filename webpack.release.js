const fs = require("fs");
const path = require("path");

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

                    // Формируем дату сборки
                    const now = new Date();
                    const buildDate = now.toISOString().replace("T", " ").substring(0, 16);

                    // Вставляем @build сразу после @version
                    header = header.replace(
                        /(@version[^\n]*)/,
                        `$1\n// @build        ${buildDate}`
                    );

                    // Автоматическое выравнивание всех @ключей
                    header = header.replace(/\/\/ @(\w+)\s+(.*)/g, (match, key, value) => {
                        const padded = key.padEnd(12, " "); // ширина 12 символов
                        return `// @${padded}${value}`;
                    });

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
