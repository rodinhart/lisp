const compile = require("./compile.js")
const { thread } = require("./lang.js")
const { fold } = require("./list.js")
const macroexpand = require("./macroexpand.js")
const primitive = require("./primitive.js")
const read = require("./read.js")
const sandbox = require("./sandbox.js")

module.exports = function(source) {
  const env = { ...primitive }

  return thread(source, [
    s => read(`(${s})`),
    fold(
      (r, exp) => {
        const expanded = macroexpand(exp, env)
        const code = compile(expanded, { ...primitive })
        sandbox(code, env)

        r.push(code)

        return r
      },
      [
        `const { EMPTY, car, cdr, cons, first, isEmpty, rest, Seq, isAtom, add, gt, sub } = require("./primitive.js")`
      ]
    ),
    // x => {
    //   x.push(`module.exports = env`)
    //   return x
    // },
    xs => xs.join(";\n\n")
  ])
}
