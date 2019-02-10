const { EMPTY, car, cdr, Cons } = require("./list.js")
const { first, isEmpty, rest, Seq } = require("./ISeq.js")
const prn = require("./print.js")

const isAtom = x => typeof x !== "object"

module.exports = {
  first,
  "isEmpty?": isEmpty,
  rest,
  Seq,
  EMPTY,
  car,
  cdr,
  cons: Cons,
  isAtom,
  object: (...xs) => {
    const r = {}
    for (let i = 0; i + 1 < xs.length; i += 2) {
      r[xs[i]] = xs[i + 1]
    }

    return r
  },
  prn,
  "+": (...xs) => xs.reduce((a, b) => a + b, 0),
  "-": (...xs) => xs[0] - xs[1],
  ">": (...xs) => xs[0] > xs[1],
  "=": (...xs) => xs[0] === xs[1],
  "*": (...xs) => xs.reduce((a, b) => a * b, 1),

  js: {
    console: console,
    document: document,
    Math: Math
  }
}
