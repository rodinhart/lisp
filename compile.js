const { assert } = require("./lang.js")
const { car, cdr, map, isCons, toArray } = require("./list.js")
const read = require("./read.js")

const compile = x => {
  if (!isCons(x)) return x === null ? "null" : x

  let op = car(x)
  if (op === "lambda" || op === "macro") {
    // (lambda (x y) (f x y))
    const args = []
    let p = car(cdr(x))
    while (p !== null) {
      if (isCons(p)) {
        args.push(car(p))
        p = cdr(p)
      } else {
        args.push(`...${p}`)
        p = null
      }
    }

    const body = compile(car(cdr(cdr(x))))

    let code = `((${args.join(", ")}) => ${body})`
    if (op === "macro") {
      code = `Object.assign(${code}, {macro:true})`
    }

    return code
  }

  if (op === "if") {
    const condition = compile(car(cdr(x)))
    const consequent = compile(car(cdr(cdr(x))))
    const alternative = compile(car(cdr(cdr(cdr(x)))))
    return `((${condition}) ? (${consequent}) : (${alternative}))`
  }

  if (op === "define") {
    const name = car(cdr(x))
    const value = compile(car(cdr(cdr(x))))
    return `global["${name}"] = (${value}), "${name}"`
  }

  if (op === "loop") {
    const names = []
    const inits = []
    let p = car(cdr(x))
    while (p !== null) {
      names.push(car(p))
      inits.push(compile(car(cdr(p))))
      p = cdr(cdr(p))
    }

    const lets = names
      .map((name, i) => `let ${name} = (${inits[i]})`)
      .join("\n")
    const args = names.map(arg => `_${arg}`).join(", ")
    const assigns = names.map((name, i) => `${name} = ${args[i]}`).join("\n")
    const body = compile(car(cdr(cdr(x))))

    return `(() => {
      ${lets}
      const recur = (${args}) => {
        ${assigns}

        return "__RECUR__"
      }
      let __RESULT__
      do {
        __RESULT__ = (${body})
      } while (__RESULT__ === "__RECUR__")

      return __RESULT__
    })()`
  }

  if (op === "quote") {
    const _ = x =>
      isCons(x) ? `cons(${_(car(x))}, ${_(cdr(x))})` : JSON.stringify(x)

    return _(car(cdr(x)))
  }

  if (op === "time") {
    return `(() => {
      let __TIME__ = new Date().getTime()
      const __RESULT__ = (${compile(car(cdr(x)))})
      __TIME__ = new Date().getTime() - __TIME__
      console.log(__TIME__ + " ms")
      return __RESULT__
    })()`
  }

  if (op === "get") {
    return `((${compile(car(cdr(x)))})["${compile(car(cdr(cdr(x))))}"])`
  }

  op = compile(op)
  const params = map(compile)(cdr(x))

  return `(${op})(${toArray(params).join(", ")})`
}

assert(compile(42) === 42)
assert(compile("x") === "x")

assert(compile(read("(lambda (x y) (f y x))")) === "((x, y) => (f)(y, x))")
assert(compile(read("(lambda x x)")) === "((...x) => x)")
assert(compile(read("(lambda () 42)")) === "(() => 42)")

assert(compile(read("(if x 42 (f 1 2))")) === "((x) ? (42) : ((f)(1, 2)))")

assert(compile(read("(define x 42)")) === `global["x"] = (42), "x"`)

// assert(
//   compile(read("(loop (n 10 a 0) (if (> n 0) (recur (+ n 1) (- a 1)) a))"))
// )

assert(
  compile(read("(quote (1 (add 1 1)))")) ===
    `cons(1, cons(cons("add", cons(1, cons(1, null))), null))`
)

assert(compile(read("(f x y)")) === "(f)(x, y)")

module.exports = compile
