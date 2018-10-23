const { EMPTY, car, cdr, cons } = require("./list.js")
const { first, isEmpty, rest, Seq } = require("./ISeq.js")

const isAtom = x => typeof x !== "object"
const sub = (...xs) => xs[0] - xs[1]
const gt = (...xs) => xs[0] > xs[1]
const eq = (...xs) => xs[0] === xs[1]
const mul = (...xs) => xs.reduce((a, b) => a * b, 1)

module.exports = {
  first,
  isEmpty,
  rest,
  Seq,
  EMPTY,
  car,
  cdr,
  cons,
  isAtom,
  "+": (...xs) => xs.reduce((a, b) => a + b, 0),
  sub,
  gt,
  eq,
  mul
}
