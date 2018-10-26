const { thread } = require("./lang.js")
const { car, cdr, fold, isCons } = require("./list.js")
const read = require("./read.js")

module.exports = source => {
  return thread(source, [
    s => read(`(${s})`),
    fold((imports, exp) => {
      if (isCons(exp) && car(exp) === "import") {
        imports.push(`require("${car(cdr(exp))}")`)
      }

      return imports
    }, []),
    imports => `module.exports = require("../src/lisp.js")(
      Object.assign({}, ${imports.join(", ")}),
      \`${source}\`
    )`
  ])
}
