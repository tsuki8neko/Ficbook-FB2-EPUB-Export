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

                    // 🔥 Подставляем версию из package.json
                    header = header.replace(
                        /@version\s+.*/,
                        `// @version     ${pkg.version}`
                    );

                    // Формируем дату сборки
                    const now = new Date();
                    const buildDate = now.toISOString().replace("T", " ").substring(0, 16);

                    // Вставляем @build сразу после @version
                    header = header.replace(
                        /(@version[^\n]*)/,
                        `$1\n// @build       ${buildDate}`
                    );

                    // 🔥 Автоматическое выравнивание всех @ключей, кроме version и build
                    header = header.replace(/\/\/ @(\w+)\s+(.*)/g, (match, key, value) => {
                        if (key === "version" || key === "build") return match;
                        const padded = key.padEnd(12, " ");
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
