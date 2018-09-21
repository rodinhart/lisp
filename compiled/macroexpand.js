const { assert } = require("../lang.js")
const { toArray } = require("../list.js")
const read = require("../read.js")
const prn = require("../print.js")

const macroexpand = x => {
  if (!(x instanceof Array)) return x

  const map = f => xs => {
    if (xs === null) return null

    if (xs instanceof Array) {
      const y = f(xs[0])
      const ys = map(f)(xs[1])
      return y === xs[0] && ys === xs[1] ? xs : [y, ys]
    }

    return f(xs)
  }

  let xs = x
  let ys = map(macroexpand)(xs)
  while (ys !== xs) {
    xs = ys
    ys = map(macroexpand)(xs)
  }

  const op = xs[0]
  if (
    typeof op !== "string" ||
    typeof global[op] !== "function" ||
    !global[op].macro
  ) {
    return xs
  }

  return macroexpand(global[op](xs[1]))
}

assert(macroexpand(42) === 42)
assert(macroexpand("y") === "y")

global.first = Object.assign(x => x[0], { macro: true })
assert(prn(macroexpand(read(`(first (add 1 2) (add 3 4))`))) === "(add 1 2)")

module.exports = macroexpand
