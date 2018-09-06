const { assert } = require("../lang.js")
const { fold, map, toArray } = require("../list.js")
const read = require("../read.js")

const compile = x => {
  if (!(x instanceof Array)) return x

  let op = x[0]
  if (op === "lambda") {
    const params = []
    let p = x[1][0]
    while (p !== null) {
      if (p instanceof Array) {
        params.push(p[0])
        p = p[1]
      } else {
        params.push(`...${p}`)
        p = null
      }
    }

    const body = compile(x[1][1][0])

    return `(${params.join(", ")}) => ${body}`
  } else if (op === "if") {
    const condition = compile(x[1][0])
    const consequent = compile(x[1][1][0])
    const alternative = compile(x[1][1][1][0])
    return `((${condition}) ? (${consequent}) : (${alternative}))`
  } else if (op === "define") {
    const name = x[1][0]
    const value = compile(x[1][1][0])
    return `global["${name}"] = (${value}), "${name}"`
  } else if (op === "for") {
    let r = ["{"]
    const names = []
    let p = x[1][0]
    while (p !== null) {
      r.push(`let ${p[0]} = (${compile(p[1][0])})`)
      names.push(p[0])
      p = p[1][1]
    }

    r.push(`while (${compile(x[1][1][0])}) {`)

    p = x[1][1][1][0]
    while (p !== null) {
      r.push(`${names.shift()} = (${compile(p[0])})`)
      p = p[1]
    }

    r.push("}")

    r.push(`(${compile(x[1][1][1][1][0])})`)

    r.push("}")

    return r.join("\n")
  }

  op = compile(op)
  const args = toArray(map(compile)(x[1]))

  return `(${op})(${args.join(", ")})`
}

assert(compile(42) === 42)
assert(compile("x") === "x")

assert(compile(read("(lambda (x y) (f y x))")) === "(x, y) => (f)(y, x)")
assert(compile(read("(lambda x x)")) === "(...x) => x")
assert(compile(read("(lambda () 42)")) === "() => 42")

assert(compile(read("(if x 42 (f 1 2))")) === "((x) ? (42) : ((f)(1, 2)))")

assert(compile(read("(define x 42)")) === `global["x"] = (42), "x"`)

// assert(compile(read("(for (n 10 a 0) (gt n 0) ((sub n 1) (add a 1)) a)")))

assert(compile(read("(f x y)")) === "(f)(x, y)")

module.exports = compile
