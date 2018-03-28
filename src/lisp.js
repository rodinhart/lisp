const fs = require("fs")

const get = key => x => x[key]
const id = x => x
const last = xs => xs[xs.length - 1]
const pipe = fs => x => fs.reduce((x, f) => f(x), x)
const tap = x => console.log(x) || x

// read :: String -> Expr
const read = s => {
  const _ = xs => {
    const x = xs.shift()
    if (x !== "(") return String(Number(x)) === x ? Number(x) : x

    const r = []
    while (xs.length && xs[0] !== ")") r.push(_(xs))
    if (xs.shift() !== ")") throw new Error("Missing ).")

    return r
  }

  return _(
    s
      .replace(/\r/g, "")
      .replace(/;.*?\n/g, "")
      .replace(/(\(|\))/g, " $1 ")
      .split(/\s/)
      .filter(id)
  )
}

// print :: Expr -> String
const print = xs =>
  xs instanceof Array
    ? xs.length === 2 && xs[0] == "quote"
      ? "'" + print(xs[1])
      : "(" + xs.map(print).join(" ") + ")"
    : typeof xs === "function" ? "->" : xs

// evalǃ :: Scope -> Expr -> Expr
const evalǃ = scope => expr => {
  if (expr instanceof Array) {
    const f = evalǃ(scope)(expr[0])
    if (typeof f !== "function") throw new Error("No such symbol. " + expr[0])

    return f(scope)(expr.slice(1))
  }

  if (typeof expr === "string") {
    if (scope[expr] === undefined)
      throw new Error("Symbol not in scope. " + expr)

    return scope[expr]
  }

  return expr
}

// core :: Symbol -> Expr
const core = {
  list: scope => expr => expr.map(evalǃ(scope)),
  quote: scope => expr => expr[0],
  fn: scope => expr => {
    const param = expr[0]
    const body = expr[1]

    return scope2 => expr =>
      evalǃ({
        ...scope,
        [param]: evalǃ(scope2)(expr[0])
      })(body)
  },
  def: scope => expr => (scope[expr[0]] = evalǃ(scope)(expr[1])),
  ".": scope => expr => {
    const obj = evalǃ(scope)(expr[0])
    const f = expr[1]
    const args = expr.slice(2).map(evalǃ(scope))

    return obj.constructor.prototype[f].apply(obj, args)
  },
  macro: scope => expr => {
    const name = expr[0]
    const param = expr[1]
    const body = expr[2]

    return (scope[name] = scope2 => expr => {
      const form = evalǃ({
        ...scope2,
        [param]: expr
      })(body)

      return evalǃ(scope2)(form)
    })
  },
  "*": scope => expr => expr.map(evalǃ(scope)).reduce((a, b) => a * b, 1),
  eval: scope => expr => evalǃ(scope)(evalǃ(scope)(expr[0])),
  if: scope => expr => {
    const p = evalǃ(scope)(expr[0])

    return p && (!(p instanceof Array) || p.length)
      ? evalǃ(scope)(expr[1])
      : evalǃ(scope)(expr[2])
  }
}

const code = fs.readFileSync("src/core.clj", "UTF-8")
const scope = { ...core }
pipe([read, evalǃ(scope), print, console.log])(code)

// REPL
const readline = require("readline")
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const _ = () => {
  rl.question(" => ", s => {
    if (s !== ".exit") {
      try {
        pipe([read, evalǃ(scope), print, console.log])(s)
      } catch (e) {
        console.log(e.message)
      }

      _()
    } else {
      rl.close()
    }
  })
}
_()
