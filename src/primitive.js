const { EMPTY, car, cdr, Cons } = require("./list.js")
const { first, isEmpty, ISeq, rest, Seq } = require("./ISeq.js")
const prn = require("./print.js")

const isAtom = x => typeof x !== "object"

module.exports = {
  first,
  "empty?": isEmpty,
  ISeq,
  rest,
  Seq,
  EMPTY,
  car,
  cdr,
  cons: Cons,
  "atom?": isAtom,
  object: (...xs) => {
    const r = {}
    for (let i = 0; i + 1 < xs.length; i += 2) {
      r[xs[i]] = xs[i + 1]
    }

    return r
  },
  prn,

  get: (obj, key) => obj[key],
  "set!": (obj, key, val) => (obj[key] = val),
  "+": (...xs) => xs.reduce((a, b) => a + b, 0),
  "-": (...xs) => xs[0] - xs[1],
  ">": (...xs) => xs[0] > xs[1],
  "<": (...xs) => xs[0] < xs[1],
  "=": (...xs) => xs[0] === xs[1],
  "*": (...xs) => xs.reduce((a, b) => a * b, 1),
  div: (a, b) => a / b,

  js: {
    console: console,
    // document: document,
    Math: Math
  },

  // currently difficult to do with List/ISeq incompatability
  do: (...xs) => xs[xs.length - 1]
}
