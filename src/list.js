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

// fold
const fold = (f, init) => p =>
  p !== EMPTY ? fold(f, f(init, car(p)))(cdr(p)) : init

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

// map
const map = f => p => (p !== EMPTY ? Cons(f(car(p)), map(f)(cdr(p))) : EMPTY)

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
  cons: Cons,
  EMPTY,
  fold,
  isCons,
  length,
  map,
  toArray,
  toList
}
