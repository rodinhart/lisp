const { EMPTY, car, cdr, cons } = require("./list.js")
const { first, isEmpty, rest, Seq } = require("./ISeq.js")

const isAtom = x => typeof x !== "object"
const add = (...xs) => xs.reduce((a, b) => a + b, 0)
const sub = (...xs) => xs[0] - xs[1]
const gt = (...xs) => xs[0] > xs[1]

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
  add,
  sub,
  gt
}
