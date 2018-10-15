const { assert } = require("./lang.js")

const Cons = (car, cdr) => ({
  _type: "Cons",
  toString: () => `(${car} . ${cdr})`,
  first: () => car,
  rest: () => cdr
})

const EMPTY = {
  _type: "Cons",
  toString: () => "()"
}

assert(String(Cons(2, Cons(3, EMPTY))) === "(2 . (3 . ()))")
assert(String(Cons(2, Cons(3, 4))) === "(2 . (3 . 4))")

// isCons
const isCons = p => p && p._type === "Cons"

const car = p => p.first()
const cdr = p => p.rest()

assert(car(Cons(1, 2)) === 1)
assert(cdr(Cons(1, 2)) === 2)

// fold
const fold = (f, init) => p =>
  p !== EMPTY ? fold(f, f(init, car(p)))(cdr(p)) : init

assert(fold((a, b) => a + b, 0)(Cons(2, Cons(3, Cons(5, EMPTY)))) === 10)

// length
const length = fold((r, x) => r + 1, 0)

// toArray
const toArray = xs =>
  fold((r, x) => {
    r.push(x)

    return r
  }, [])(xs)

// concat
const concat = (xs, ys) =>
  xs !== EMPTY ? Cons(car(xs), concat(cdr(xs), ys)) : ys

assert(
  JSON.stringify(
    toArray(concat(Cons(1, Cons(2, EMPTY)), Cons(3, Cons(4, EMPTY))))
  ) === "[1,2,3,4]"
)

// map
const map = f => p => (p !== EMPTY ? Cons(f(car(p)), map(f)(cdr(p))) : EMPTY)

assert(String(map(x => x * 2)(Cons(2, Cons(3, EMPTY)))) === "(4 . (6 . ()))")

// toList
const toList = xs => {
  const _ = i => (i < xs.length ? Cons(xs[i], _(i + 1)) : EMPTY)

  return _(0)
}

module.exports = {
  car,
  cdr,
  concat,
  Cons,
  EMPTY,
  fold,
  isCons,
  length,
  map,
  toArray,
  toList
}
