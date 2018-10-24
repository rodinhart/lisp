const path = require("path")

module.exports = {
  entry: "./app/index.js",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.clj$/,
        use: [
          {
            loader: path.resolve("./src/lisp-loader.js")
          }
        ]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  watch: false
}
