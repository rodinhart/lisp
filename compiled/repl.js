const fs = require("fs")

const compile = require("./compile.js")
const { thread } = require("../lang.js")
const { car, cdr, Cons, fold } = require("../list.js")
const macroexpand = require("./macroexpand.js")
const read = require("../read.js")
const prn = require("../print.js")

const add = (...xs) => xs.reduce((a, b) => a + b, 0)
const sub = (...xs) => xs[0] - xs[1]
const gt = (...xs) => xs[0] > xs[1]
const print = (...xs) => prn(xs[0])
const cons = Cons
const isAtom = x => typeof x !== "object"

const seqArray = (xs, i) =>
  i < xs.length
    ? {
        first: () => xs[i],
        rest: () => seqArray(xs, i + 1)
      }
    : null

const seq = x => {
  if (x === null) return null

  if (x.first && x.rest) return x

  if (x instanceof Array) return seqArray(x, 0)

  throw Error(`Failed to seq from ${x}`)
}

const first = x => seq(x).first()
const rest = x => seq(x).rest()

const DEBUG = false

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
