const { EMPTY, car, cdr, Cons, isCons } = require("./list.js")
const { map } = require("./ISeq.js")

const ENV = "env"

const compile = (x, env) => {
  if (
    x === undefined ||
    x === null ||
    typeof x === "boolean" ||
    typeof x === "number"
  ) {
    return String(x)
  }

  if (typeof x === "string") return `"${x}"`

  if (typeof x === "symbol") {
    const name = Symbol.keyFor(x)
    if (env[name]) return name // in scope

    const gets = name.split("/").map(x => `["${x}"]`)
    return `${ENV}${gets.join("")}`
  }

  if (x instanceof Array) return `[${x.map(y => compile(y, env)).join(",")}]`

  if (!isCons(x))
    return `{${Object.entries(x)
      .map(([key, val]) => `"${key}":${compile(val, env)}`)
      .join(",")}}`

  if (x === EMPTY) return `${ENV}["EMPTY"]`

  let op = car(x)
  if (op === Symbol.for("lambda") || op === Symbol.for("macro")) {
    // (lambda (x y) (f x y))
    const args = []
    const newEnv = { ...env }
    let p = car(cdr(x))
    while (p !== EMPTY) {
      if (isCons(p)) {
        args.push(Symbol.keyFor(car(p)))
        newEnv[Symbol.keyFor(car(p))] = true
        p = cdr(p)
      } else {
        args.push(`...${Symbol.keyFor(p)}`)
        newEnv[Symbol.keyFor(p)] = true
        p = EMPTY
      }
    }

    const body = [...map(x => compile(x, newEnv), cdr(cdr(x)))].join(",")

    let code = `((${args.join(",")}) => (${body}))`
    if (op === Symbol.for("macro")) {
      code = `Object.assign(${code}, {macro:true})`
    }

    return code
  }

  if (op === Symbol.for("if")) {
    const condition = compile(car(cdr(x)), env)
    const consequent = compile(car(cdr(cdr(x))), env)
    const alternative =
      cdr(cdr(cdr(x))) !== EMPTY
        ? compile(car(cdr(cdr(cdr(x)))), env)
        : "undefined"
    return `((${condition}) ? (${consequent}) : (${alternative}))`
  }

  if (op === Symbol.for("define")) {
    const name = Symbol.keyFor(car(cdr(x)))
    const value = compile(car(cdr(cdr(x))), env)
    return `${ENV}["${name}"] = (${value}), Symbol.for("${name}")`
  }

  if (op === Symbol.for("loop")) {
    // (loop (x 5) (if (= x 0) x (recur (- x 1))))
    const names = []
    const inits = []
    let p = car(cdr(x))
    while (p !== EMPTY) {
      names.push(Symbol.keyFor(car(p)))
      inits.push(compile(car(cdr(p)), env))
      p = cdr(cdr(p))
    }

    const lets = names
      .map((name, i) => `let ${name} = (${inits[i]})`)
      .join("\n")
    const args = names.map(arg => `_${arg}`).join(", ")
    const assigns = names.map((name, i) => `${name} = _${name}`).join("\n")
    const locals = names.reduce(
      (env, name) => {
        env[name] = true

        return env
      },
      { ...env, recur: true }
    )
    const body = [...map(x => compile(x, locals), cdr(cdr(x)))]

    return `(() => {
      ${lets}
      const recur = (${args}) => {
        ${assigns}

        return "__RECUR__"
      }
      let __RESULT__
      do {
        __RESULT__ = (${body.join(",")})
      } while (__RESULT__ === "__RECUR__")

      return __RESULT__
    })()`
  }

  if (op === Symbol.for("quote")) {
    const _ = x =>
      !isCons(x)
        ? typeof x === "symbol"
          ? `Symbol.for("${Symbol.keyFor(x)}")`
          : JSON.stringify(x)
        : x === EMPTY
        ? `${ENV}["EMPTY"]`
        : `${ENV}["cons"](${_(car(x))}, ${_(cdr(x))})`

    return _(car(cdr(x)))
  }

  if (op === Symbol.for("time")) {
    return `(() => {
      let __TIME__ = new Date().getTime()
      const __RESULT__ = (${compile(car(cdr(x)), env)})
      __TIME__ = new Date().getTime() - __TIME__
      console.log(__TIME__ + " ms")
      return __RESULT__
    })()`
  }

  if (op === Symbol.for("seq")) {
    return `${ENV}["Seq"](() => ${compile(car(cdr(x)), env)}, () => ${compile(
      car(cdr(cdr(x))),
      env
    )})`
  }

  // interop
  if (op === Symbol.for("import")) {
    return "" //`Object.assign(${ENV}, require("${car(cdr(x))}"))`
  }

  let args = []
  let cur = cdr(x)
  while (cur !== EMPTY) {
    if (isCons(cur)) {
      args.push(compile(car(cur), env))
      cur = cdr(cur)
    } else {
      args.push(`...${ENV}.ISeq(${compile(cur, env)})`)
      cur = EMPTY
    }
  }

  if (typeof op === "symbol" && Symbol.keyFor(op)[0] === ".") {
    return `${args[0]}["${Symbol.keyFor(op).substr(1)}"](${args
      .slice(1)
      .join(",")})`
  }

  op = compile(op, env)

  return `${ENV}.IFn(${op})(${args.join(",")})`
}

module.exports = compile
