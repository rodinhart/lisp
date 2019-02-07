const { EMPTY, car, cdr, Cons, isCons, map } = require("./list.js")

// map2 that preserves referential equal if possible
const map2 = f => xs => {
  if (xs === EMPTY) return EMPTY

  if (isCons(xs)) {
    const y = f(car(xs))
    const ys = map2(f)(cdr(xs))
    return y === car(xs) && ys === cdr(xs) ? xs : Cons(y, ys)
  }

  return f(xs)
}

const macroexpand = (x, env) => {
  if (!isCons(x) || x === EMPTY) return x

  let xs = x
  let ys = map2(x => macroexpand(x, env))(xs)
  while (ys !== xs) {
    xs = ys
    ys = map2(y => macroexpand(y, env))(xs)
  }

  const op = car(xs)
  if (
    typeof op !== "string" ||
    typeof env[op] !== "function" ||
    !env[op].macro
  ) {
    return xs
  }

  return macroexpand(env[op](...map(x => x, cdr(xs))), env)
}

module.exports = macroexpand
