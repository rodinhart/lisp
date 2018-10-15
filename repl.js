const fs = require("fs")

const compile = require("./compile.js")
const { thread } = require("./lang.js")
const { fold } = require("./list.js")
const macroexpand = require("./macroexpand.js")
const prn = require("./print.js")
const read = require("./read.js")
const sandbox = require("./sandbox.js")

const DEBUG = false

thread(String(fs.readFileSync("./core.clj")), [
  s => `(${s})`,
  read,

  fold((r, x) => {
    if (DEBUG) console.log("EXPR", prn(x))
    const expanded = macroexpand(x)
    if (DEBUG) console.log("EXPANDED", prn(expanded))
    const code = compile(expanded)
    if (DEBUG) console.log("CODE", code)
    if (DEBUG) console.log()
    return sandbox(code)
  }, null),
  prn,

  x => console.log(x)
])
