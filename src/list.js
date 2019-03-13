const EMPTY = {
  _type: "Cons",
  [Symbol.iterator]: function*() {},
  toString: () => "()"
}

const Cons = (car, cdr) => ({
  _type: "Cons",
  car,
  cdr,
  [Symbol.for("ISeq")]: {
    first: () => car,
    rest: () => cdr
  },
  toString: () => `(${car} . ${cdr})`
})

const isCons = p => p && p._type === "Cons"

const car = p => p.car
const cdr = p => p.cdr

module.exports = {
  EMPTY,
  car,
  cdr,
  Cons,
  isCons
}
