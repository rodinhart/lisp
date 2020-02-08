const path = require("path")

module.exports = {
  devtool: "inline-source-map",
  entry: "./app/index.clj",
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
