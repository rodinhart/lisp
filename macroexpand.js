const { assert } = require("./lang.js")
const { car, cdr, Cons, EMPTY, isCons, toArray } = require("./list.js")
const read = require("./read.js")
const prn = require("./print.js")

const map = f => xs => {
  if (xs === EMPTY) return EMPTY

  // if (isCons(xs)) {
  const y = f(car(xs))
  const ys = map(f)(cdr(xs))
  return y === car(xs) && ys === cdr(xs) ? xs : Cons(y, ys)
  // }

  // return f(xs)
}

const macroexpand = x => {
  if (!isCons(x) || x === EMPTY) return x

  let xs = x
  let ys = map(macroexpand)(xs)
  while (ys !== xs) {
    xs = ys
    ys = map(macroexpand)(xs)
  }

  const op = car(xs)
  if (
    typeof op !== "string" ||
    typeof global[op] !== "function" ||
    !global[op].macro
  ) {
    return xs
  }

  return macroexpand(global[op].apply(null, toArray(cdr(xs))))
}

assert(macroexpand(42) === 42)
assert(macroexpand("y") === "y")

global.first__ = Object.assign((x, y) => x, { macro: true })
assert(prn(macroexpand(read(`(first__ (add 1 2) (add 3 4))`))) === "(add 1 2)")

module.exports = macroexpand
