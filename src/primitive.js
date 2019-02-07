const { EMPTY, car, cdr, cons } = require("./list.js")
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
  cons,
  isAtom,
  prn,
  "+": (...xs) => xs.reduce((a, b) => a + b, 0),
  "-": (...xs) => xs[0] - xs[1],
  ">": (...xs) => xs[0] > xs[1],
  "=": (...xs) => xs[0] === xs[1],
  "*": (...xs) => xs.reduce((a, b) => a * b, 1)
}
