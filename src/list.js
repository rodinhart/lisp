const EMPTY = {
  _type: "Cons",
  toString: () => "()",
  [Symbol.iterator]: function*() {}
}

const Cons = (car, cdr) => ({
  _type: "Cons",
  toString: () => `(${car} . ${cdr})`,
  first: () => car,
  rest: () => cdr,
  [Symbol.iterator]: function*() {
    let c = Cons(car, cdr)
    while (c !== EMPTY) {
      yield c.first()
      c = c.rest()
    }
  }
})

// isCons
const isCons = p => p && p._type === "Cons"

const car = p => p.first()
const cdr = p => p.rest()

module.exports = {
  car,
  cdr,
  Cons,
  cons: Cons,
  EMPTY,
  isCons
}
