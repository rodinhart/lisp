const { thread } = require("./lang.js")
const { car, cdr, fold, isCons } = require("./list.js")
const read = require("./read.js")

module.exports = source => {
  return thread(source, [
    s => read(`(${s})`),
    x =>
      fold(
        (imports, exp) => {
          if (isCons(exp) && car(exp) === "import") {
            imports.push(
              `{"${car(cdr(exp))}": require("${car(cdr(cdr(exp)))}")}`
            )
          }

          return imports
        },
        [],
        x
      ),
    imports => `module.exports = require("../src/lisp.js")(
      Object.assign({}, require("../src/core.scm"), ${imports.join(", ")}),
      \`${source}\`
    )`
  ])
}
