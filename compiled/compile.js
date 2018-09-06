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
    return `${condition} ? ${consequent} : ${alternative}`
  } else if (op === "define") {
    const name = x[1][0]
    const value = compile(x[1][1][0])
    return `const ${name} = ${value}`
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

assert(compile(read("(if x 42 32)")) === "x ? 42 : 32")

assert(compile(read("(define x 42)")) === "const x = 42")

assert(compile(read("(f x y)")) === "(f)(x, y)")

assert(
  compile(
    read(`(define sum (lambda (n a) (if (> n 0) (sum (- n 1) (+ a 1)) a)))`)
  )
)
