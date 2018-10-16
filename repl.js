const fs = require("fs")

const compile = require("./compile.js")
const { thread } = require("./lang.js")
const { EMPTY, car, cdr, cons, fold } = require("./list.js")
const macroexpand = require("./macroexpand.js")
const prn = require("./print.js")
const read = require("./read.js")
const sandbox = require("./sandbox.js")
const { first, isEmpty, rest, Seq } = require("./ISeq.js")

const DEBUG = false

const isAtom = x => typeof x !== "object"
const add = (...xs) => xs.reduce((a, b) => a + b, 0)
const sub = (...xs) => xs[0] - xs[1]
const gt = (...xs) => xs[0] > xs[1]

const core = {
  first,
  isEmpty,
  rest,
  Seq,
  EMPTY,
  car,
  cdr,
  cons,
  isAtom,
  add,
  sub,
  gt
}

const env = { ...core }
thread(String(fs.readFileSync("./core.clj")), [
  s => `(${s})`,
  read,

  fold((r, x) => {
    if (DEBUG) console.log("EXPR", prn(x))
    const expanded = macroexpand(x, env)
    if (DEBUG) console.log("EXPANDED", prn(expanded))
    const code = compile(expanded, {})
    if (DEBUG) console.log("CODE", code)
    if (DEBUG) console.log()
    sandbox(code, env)

    r.push(code)

    return r
  }, []),

  // prn,
  lines => lines.join(";\n\n"),

  x => console.log(x)
])
