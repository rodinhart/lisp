const { assert } = require("./lang.js")
const { car, cdr, EMPTY, map, isCons, toArray } = require("./list.js")
const read = require("./read.js")

const compile = (x, env) => {
  if (x === null) return null
  if (typeof x === "string")
    return env[x]
      ? x
      : x.startsWith("js.")
        ? x.substr(3).replace(/\//, ".")
        : `env["${x}"]`
  if (!isCons(x)) return x

  if (x === EMPTY) return `env["EMPTY"]`

  let op = car(x)
  if (op === "lambda" || op === "macro") {
    // (lambda (x y) (f x y))
    const args = []
    const newEnv = { ...env }
    let p = car(cdr(x))
    while (p !== EMPTY) {
      if (isCons(p)) {
        args.push(car(p))
        newEnv[car(p)] = true
        p = cdr(p)
      } else {
        args.push(`...${p}`)
        newEnv[p] = true
        p = EMPTY
      }
    }

    const body = compile(car(cdr(cdr(x))), newEnv)

    let code = `((${args.join(", ")}) => ${body})`
    if (op === "macro") {
      code = `Object.assign(${code}, {macro:true})`
    }

    return code
  }

  if (op === "if") {
    const condition = compile(car(cdr(x)), env)
    const consequent = compile(car(cdr(cdr(x))), env)
    const alternative = compile(car(cdr(cdr(cdr(x)))), env)
    return `((${condition}) ? (${consequent}) : (${alternative}))`
  }

  if (op === "define") {
    const name = car(cdr(x))
    const value = compile(car(cdr(cdr(x))), env)
    return `env["${name}"] = (${value}), "${name}"`
  }

  if (op === "loop") {
    const names = []
    const inits = []
    let p = car(cdr(x))
    while (p !== EMPTY) {
      names.push(car(p))
      inits.push(compile(car(cdr(p)), env))
      p = cdr(cdr(p))
    }

    const lets = names
      .map((name, i) => `let ${name} = (${inits[i]})`)
      .join("\n")
    const args = names.map(arg => `_${arg}`).join(", ")
    const assigns = names.map((name, i) => `${name} = _${name}`).join("\n")
    const body = compile(
      car(cdr(cdr(x))),
      names.reduce(
        (env, name) => {
          env[name] = true

          return env
        },
        { ...env, recur: true }
      )
    )

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
      !isCons(x)
        ? JSON.stringify(x)
        : x === EMPTY
          ? `env["EMPTY"]`
          : `cons(${_(car(x))}, ${_(cdr(x))})`

    return _(car(cdr(x)))
  }

  if (op === "time") {
    return `(() => {
      let __TIME__ = new Date().getTime()
      const __RESULT__ = (${compile(car(cdr(x)), env)})
      __TIME__ = new Date().getTime() - __TIME__
      console.log(__TIME__ + " ms")
      return __RESULT__
    })()`
  }

  if (op === "seq") {
    return `env["Seq"](() => ${compile(car(cdr(x)), env)}, () => ${compile(
      car(cdr(cdr(x))),
      env
    )})`
    // return `({
    //   first: () => ${compile(car(cdr(x)))},
    //   rest: () => ${compile(car(cdr(cdr(x))))},
    //   toString: () => "[Seq]"
    // })`
  }

  // interop
  if (op === "get") {
    return `((${compile(car(cdr(x)), env)})["${compile(
      car(cdr(cdr(x))),
      env
    )}"])`
  }

  op = compile(op, env)
  const params = map(x => compile(x, env))(cdr(x))

  return `(${op})(${toArray(params).join(", ")})`
}

assert(compile(null, {}) === null)
assert(compile(42, {}) === 42)
assert(compile("x", { x: true }) === "x")
assert(compile("y", {}) === `env["y"]`)

assert(
  compile(read("(lambda (x y) (f y x))"), { f: true }) ===
    "((x, y) => (f)(y, x))"
)
assert(compile(read("(lambda x x)"), {}) === "((...x) => x)")
assert(compile(read("(lambda () 42)"), {}) === "(() => 42)")

assert(
  compile(read("(if x 42 (f 1 2))"), { x: true, f: true }) ===
    "((x) ? (42) : ((f)(1, 2)))"
)

assert(compile(read("(define x 42)"), {}) === `env["x"] = (42), "x"`)

assert(
  compile(read("(quote (1 (add 1 1)))"), { add: true }) ===
    `cons(1, cons(cons("add", cons(1, cons(1, env["EMPTY"]))), env["EMPTY"]))`
)

assert(compile(read("(f x y)"), { f: true, x: true, y: true }) === "(f)(x, y)")

module.exports = compile
