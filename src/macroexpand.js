const { car, cdr, Cons, EMPTY, isCons } = require("./list.js")

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

  return macroexpand(env[op](...cdr(xs)), env)
}

module.exports = macroexpand
