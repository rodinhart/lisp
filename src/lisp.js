const compile = require("./compile.js")
const { fold } = require("./ISeq.js")
const { thread } = require("./lang.js")
const macroexpand = require("./macroexpand.js")
const primitive = require("./primitive.js")
const read = require("./read.js")
const sandbox = require("./sandbox.js")

const lisp = (imports, source) => {
  const env = { ...primitive, ...imports }

  return thread(source, [
    s => read(`(${s})`),
    x =>
      fold(
        (r, exp) => {
          const expanded = macroexpand(exp, env)
          const code = compile(expanded, {})

          return sandbox(code, env)
        },
        undefined,
        x
      ),
    _ => env
  ])
}

module.exports = lisp
