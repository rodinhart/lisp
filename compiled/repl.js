const fs = require("fs")

const compile = require("./compile.js")
const { thread } = require("../lang.js")
const { fold } = require("../list.js")
const macroexpand = require("./macroexpand.js")
const read = require("../read.js")
const prn = require("../print.js")

const add = xs => fold((r, x) => r + x, 0)(xs)
const sub = xs => xs[0] - xs[1][0]
const gt = xs => xs[0] > xs[1][0]
const print = params => prn(params[0])
const car = xs => xs[0][0]
const cdr = xs => xs[0][1]
const cons = params => [params[0], params[1][0]]
const isAtom = xs => !(xs[0] instanceof Array)

const DEBUG = true

thread(
  String(fs.readFileSync("./core.clj")),
  s => `(${s})`,
  read,

  fold((r, x) => {
    if (DEBUG) console.log("EXPR", prn(x))
    const expanded = macroexpand(x)
    if (DEBUG) console.log("EXPANDED", prn(expanded))
    const code = compile(expanded)
    if (DEBUG) console.log("CODE", code)
    if (DEBUG) console.log()
    return eval(code)
  }, null),
  prn,

  x => console.log(x)
)
