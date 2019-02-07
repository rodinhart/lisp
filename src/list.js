const EMPTY = {
  _type: "Cons",
  toString: () => "()"
}

const Cons = (car, cdr) => ({
  _type: "Cons",
  car,
  cdr,
  toString: () => `(${car} . ${cdr})`,
  first: () => car,
  rest: () => cdr
})

const isCons = p => p && p._type === "Cons"

const car = p => p.car
const cdr = p => p.cdr

// fold :: (r -> a -> r) -> r -> List a -> r
const fold = (f, init, xs) => {
  let r = init
  let c = xs
  while (c !== EMPTY) {
    r = f(r, car(c))
    c = cdr(c)
  }

  return r
}

// map :: (a -> b) -> List a -> [b]
const map = (f, xs) => {
  const r = []
  let c = xs
  while (c !== EMPTY) {
    r.push(f(car(c)))
    c = cdr(c)
  }

  return r
}

module.exports = {
  EMPTY,
  car,
  cdr,
  Cons,
  fold,
  isCons,
  map
}
