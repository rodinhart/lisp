const { assert, thread } = require("./lang.js")
const read = require("./read.js")
const prn = require("./print.js")
const evalǃ = require("./eval.js")
const core = require("./core.js")

const macroexpand = scope => x => {
  if (!(x instanceof Array)) return x

  const map = f => xs => {
    if (xs === null) return null

    const y = f(xs[0])
    const ys = map(f)(xs[1])
    return y === xs[0] && ys === xs[1] ? xs : [y, ys]
  }

  let xs = x
  let ys = map(macroexpand(scope))(xs)
  while (ys !== xs) {
    xs = ys
    ys = map(macroexpand(scope))(xs)
  }

  const op = scope[xs[0]]
  if (!(op instanceof Array && op[0] === "macro")) return xs

  // op = (macro (x) x scope)
  // xs = (defn foo (bar) 42)
  let newScope = { ...op[1][1][1][0] }
  let names = op[1][0]
  xs = xs[1]
  while (names !== null) {
    if (names instanceof Array) {
      newScope[names[0]] = xs[0]
      names = names[1]
      xs = xs[1]
    } else {
      newScope[names] = xs
      names = null
      xs = null
    }
  }

  return macroexpand(scope)(evalǃ(newScope)(op[1][1][0]))
}

core.macroexpand = scope => xs => macroexpand(scope)(xs[0])

const mac = evalǃ(core)(read(`(macro (x) (cons x (cons x ())))`))
assert(
  thread(
    `(m 3)`,
    read,
    macroexpand({
      ...core,
      m: mac
    }),
    prn
  ) === "(3 3)"
)

assert(
  thread(
    `(m (m 3))`,
    read,
    macroexpand({
      ...core,
      m: mac
    }),
    prn
  ) === "((3 3) (3 3))"
)

assert(
  thread(
    `(concat (m 3))`,
    read,
    macroexpand({
      ...core,
      m: mac
    }),
    prn
  ) === "(concat (3 3))"
)

const mec = evalǃ(core)(read(`(macro x (cons (quote m) x))`))
assert(
  thread(
    `(mec 4)`,
    read,
    macroexpand({
      ...core,
      m: mac,
      mec
    }),
    prn
  ) === "(4 4)"
)

module.exports = macroexpand
