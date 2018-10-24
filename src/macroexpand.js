const { assert } = require("./lang.js")
const { car, cdr, Cons, EMPTY, isCons, toArray } = require("./list.js")
const read = require("./read.js")
const prn = require("./print.js")

// map that preserves referential equal if possible
const map = f => xs => {
  if (xs === EMPTY) return EMPTY

  if (isCons(xs)) {
    const y = f(car(xs))
    const ys = map(f)(cdr(xs))
    return y === car(xs) && ys === cdr(xs) ? xs : Cons(y, ys)
  }

  return f(xs)
}

const macroexpand = (x, env) => {
  if (!isCons(x) || x === EMPTY) return x

  let xs = x
  let ys = map(x => macroexpand(x, env))(xs)
  while (ys !== xs) {
    xs = ys
    ys = map(y => macroexpand(y, env))(xs)
  }

  const op = car(xs)
  if (
    typeof op !== "string" ||
    typeof env[op] !== "function" ||
    !env[op].macro
  ) {
    return xs
  }

  return macroexpand(env[op].apply(null, toArray(cdr(xs))), env)
}

assert(macroexpand(null, {}) === null)
assert(macroexpand(EMPTY, {}) === EMPTY)
assert(macroexpand(42, {}) === 42)
assert(macroexpand("y", {}) === "y")

assert(prn(macroexpand(read(`(1 2 3)`))) === "(1 2 3)")
assert(prn(macroexpand(read(`(1 2 . 3)`))) === "(1 2 . 3)")

const env = {}
env.first__ = Object.assign((x, y) => x, { macro: true })
assert(
  prn(macroexpand(read(`(first__ (add 1 2) (add 3 4))`), env)) === "(add 1 2)"
)

module.exports = macroexpand
