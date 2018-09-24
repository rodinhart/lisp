const { assert } = require("../lang.js")
const { fold, map } = require("../list.js")
const read = require("../read.js")

const compile = x => {
  if (!(x instanceof Array)) return x

  let op = x[0]
  if (op === "lambda" || op === "macro") {
    // (lambda (x y) (f x y))
    const args = []
    const params = []
    let nth = ""
    let p = x[1][0]
    while (p !== null) {
      if (p instanceof Array) {
        args.push(p[0])
        params.push(`a${nth}[0]`)
        nth += "[1]"
        p = p[1]
      } else {
        args.push(p)
        params.push(`a${nth}`)
        p = null
      }
    }

    const body = compile(x[1][1][0])

    let code = `(a => ((${args.join(", ")}) => ${body})(${params.join(", ")}))`
    if (op === "macro") {
      code = `Object.assign(${code}, {macro:true})`
    }

    return code
  } else if (op === "if") {
    const condition = compile(x[1][0])
    const consequent = compile(x[1][1][0])
    const alternative = compile(x[1][1][1][0])
    return `((${condition}) ? (${consequent}) : (${alternative}))`
  } else if (op === "define") {
    const name = x[1][0]
    const value = compile(x[1][1][0])
    return `global["${name}"] = (${value}), "${name}"`
  } else if (op === "loop") {
    const names = []
    const inits = []
    const vals = []
    let val = ""
    let p = x[1][0]
    while (p !== null) {
      names.push(p[0])
      inits.push(compile(p[1][0]))
      vals.push(`t${val}[0]`)
      val += "[1]"
      p = p[1][1]
    }

    const lets = names
      .map((name, i) => `let ${name} = (${inits[i]})`)
      .join("\n")
    const assigns = names.map((name, i) => `${name} = ${vals[i]}`).join("\n")
    const body = compile(x[1][1][0])

    return `(() => {
      ${lets}
      const recur = t => {
        ${assigns}

        return "__RECUR__"
      }
      let __RESULT__
      do {
        __RESULT__ = (${body})
      } while (__RESULT__ === "__RECUR__")

      return __RESULT__
    })()`
  } else if (op === "quote") {
    return JSON.stringify(x[1][0])
  } else if (op === "time") {
    return `(() => {
      let __TIME__ = new Date().getTime()
      const __RESULT__ = (${compile(x[1][0])})
      __TIME__ = new Date().getTime() - __TIME__
      console.log(__TIME__ + " ms")
      return __RESULT__
    })()`
  } else if (op === "get") {
    return `((${compile(x[1][0])})["${compile(x[1][1][0])}"])`
  }

  op = compile(op)
  const params = map(compile)(x[1])

  const toList = xs =>
    xs === null
      ? null
      : xs instanceof Array
        ? `[${xs[0]}, ${toList(xs[1])}]`
        : xs

  return `(${op})(${toList(params)})`
}

assert(compile(42) === 42)
assert(compile("x") === "x")

assert(
  compile(read("(lambda (x y) (f y x))")) ===
    "(a => ((x, y) => (f)([y, [x, null]]))(a[0], a[1][0]))"
)
assert(compile(read("(lambda x x)")) === "(a => ((x) => x)(a))")
assert(compile(read("(lambda () 42)")) === "(a => (() => 42)())")

assert(
  compile(read("(if x 42 (f 1 2))")) === "((x) ? (42) : ((f)([1, [2, null]])))"
)

assert(compile(read("(define x 42)")) === `global["x"] = (42), "x"`)

// assert(
//   compile(read("(loop (n 10 a 0) (if (> n 0) (recur (+ n 1) (- a 1)) a))"))
// )

assert(
  compile(read("(quote (1 (add 1 1)))")) === `[1,[["add",[1,[1,null]]],null]]`
)

assert(compile(read("(f x y)")) === "(f)([x, [y, null]])")

module.exports = compile
