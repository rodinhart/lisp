const fs = require("fs")

const compile = require("./compile.js")
const { first, getSeq, rest } = require("./ISeq.js")
const { thread } = require("./lang.js")
const { car, cdr, Cons, EMPTY, fold } = require("./list.js")
const macroexpand = require("./macroexpand.js")
const read = require("./read.js")
const prn = require("./print.js")

const add = (...xs) => xs.reduce((a, b) => a + b, 0)
const sub = (...xs) => xs[0] - xs[1]
const gt = (...xs) => xs[0] > xs[1]
const print = (...xs) => prn(xs[0])
const cons = Cons
const isAtom = x => typeof x !== "object"
const isEmpty = x => getSeq(x) === null

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
    return eval(code)
  }, null),
  prn,

  x => console.log(x)
])
