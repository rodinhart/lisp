const { fold } = require("./ISeq.js")
const { thread } = require("./lang.js")
const { car, cdr, isCons } = require("./list.js")
const read = require("./read.js")

module.exports = source => {
  return thread(source, [
    s => read(`(${s})`),
    x =>
      fold(
        (imports, exp) => {
          if (
            isCons(exp) &&
            typeof car(exp) === "symbol" &&
            car(exp) === Symbol.for("import")
          ) {
            imports.push(
              `{"${Symbol.keyFor(car(cdr(exp)))}": require("${Symbol.keyFor(
                car(cdr(cdr(exp)))
              )}")}`
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
