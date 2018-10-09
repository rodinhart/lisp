const { assert } = require("./lang.js")

// Cons, car, cdr
const Cons = (car, cdr) => ({
  car, // TODO remove these
  cdr, // TODO remove these
  toString: () => `(${car} . ${cdr ? cdr : "nil"})`,
  first: () => car,
  rest: () => cdr
})

assert(String(Cons(2, Cons(3, 4))) === "(2 . (3 . 4))")

// isCons
const isCons = p => p && p.car !== undefined && p.cdr !== undefined

const car = p => p.car
const cdr = p => p.cdr

assert(car(Cons(1, 2)) === 1)
assert(cdr(Cons(1, 2)) === 2)

// fold
const fold = (f, init) => p =>
  p !== null ? fold(f, f(init, p.car))(p.cdr) : init

assert(fold((a, b) => a + b, 0)(Cons(2, Cons(3, Cons(5, null)))) === 10)

// length
const length = fold((r, x) => r + 1, 0)

// toArray
const toArray = xs =>
  fold((r, x) => {
    r.push(x)

    return r
  }, [])(xs)

// concat
const concat = (xs, ys) => (xs !== null ? Cons(xs.car, concat(xs.cdr, ys)) : ys)

assert(
  JSON.stringify(
    toArray(concat(Cons(1, Cons(2, null)), Cons(3, Cons(4, null))))
  ) === "[1,2,3,4]"
)

// map
const map = f => p => (p !== null ? Cons(f(p.car), map(f)(p.cdr)) : null)

assert(String(map(x => x * 2)(Cons(2, Cons(3, null)))) === "(4 . (6 . nil))")

// toList
const toList = xs => {
  const _ = i => (i < xs.length ? Cons(xs[i], _(i + 1)) : null)

  return _(0)
}

module.exports = {
  car,
  cdr,
  concat,
  Cons,
  fold,
  isCons,
  length,
  map,
  toArray,
  toList
}
