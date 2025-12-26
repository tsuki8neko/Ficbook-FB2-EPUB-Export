const fs = require("fs");

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "ficbook-export.user.js",
    path: __dirname + "/dist",
    module: true,
  },
  experiments: {
    outputModule: true,
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.js$/,
        type: "javascript/esm",
      }
    ]
  },
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.emit.tap("AddHeader", (compilation) => {
          const header = fs.readFileSync("./tampermonkey-header.js", "utf8");
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
