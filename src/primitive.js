const { EMPTY, car, cdr, Cons } = require("./list.js")
const { IFn } = require("./IFn.js")
const { first, isEmpty, ISeq, rest, Seq } = require("./ISeq.js")
const prn = require("./print.js")

const isAtom = x => typeof x !== "object"

module.exports = {
  first,
  "empty?": isEmpty,
  IFn,
  ISeq,
  rest,
  Seq,
  EMPTY,
  car,
  cdr,
  cons: Cons,
  "atom?": isAtom,

  array: (...xs) => xs,
  list: (...xs) => {
    const _ = i => (i < xs.length ? Cons(xs[i], _(i + 1)) : EMPTY)

    return _(0)
  },
  max: (...xs) => Math.max(...xs),
  min: (...xs) => Math.min(...xs),
  object: (...xs) => {
    const r = {}
    for (let i = 0; i + 1 < xs.length; i += 2) {
      r[xs[i]] = xs[i + 1]
    }

    return r
  },
  prn,

  "set!": (obj, key, val) => (obj[key] = val),
  "update!": (obj, key, f) => (obj[key] = f(obj[key])),
  "+": (...xs) => xs.reduce((a, b) => a + b, 0),
  "-": (...xs) => (xs.length === 1 ? -xs[0] : xs[0] - xs[1]),
  ">": (...xs) => xs[0] > xs[1],
  ">=": (a, b) => a >= b,
  "<": (...xs) => xs[0] < xs[1],
  "=": (...xs) => xs[0] === xs[1],
  "*": (...xs) => xs.reduce((a, b) => a * b, 1),
  "/": (a, b) => a / b,

  js: {
    console: console,
    Date: Date,
    setTimeout: setTimeout,
    Math: Math
  }
}
