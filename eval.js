const { assert } = require("./lang.js")
const { concat, length, map } = require("./list.js")
const read = require("./read.js")
const core = require("./core.js")

const evalǃ = _scope => x => {
  let scope = _scope
  while (true) {
    if (x instanceof Array) {
      // combination
      const op = evalǃ(scope)(x[0])

      switch (op) {
        case "LAMBDA":
          return concat(x, [scope, null])

        case "IF":
          const cond = evalǃ(scope)(x[1][0])
          if (cond !== null) {
            x = x[1][1][0]
          } else {
            x = x[1][1][1][0]
          }
          break

        case "DEFINE":
          scope[x[1][0]] = evalǃ(scope)(x[1][1][0])
          return x[1][0]

        case "QUOTE":
          return x[1][0]

        case "MACRO":
          return concat(x, [scope, null])

        default:
          if (op instanceof Array && op[0] === "lambda") {
            // (lambda (x y) (+ x y) scope)
            let newScope = { ...op[1][1][1][0] }
            let names = op[1][0]
            x = x[1]
            while (names !== null) {
              if (names instanceof Array) {
                newScope[names[0]] = evalǃ(scope)(x[0])
                names = names[1]
                x = x[1]
              } else {
                newScope[names] = map(evalǃ(scope))(x)
                names = null
              }
            }

            scope = newScope
            x = op[1][1][0]
          } else if (typeof op === "function") {
            return op(scope)(map(evalǃ(scope))(x[1]))
          } else {
            throw new Error(
              "Unknown operation: " +
                prn(op) +
                "\nin " +
                prn(x) +
                "\nwith " +
                prn(scope)
            )
          }
          break
      }
    } else {
      if (typeof x === "string") {
        if (scope[x] === undefined) throw new Error("No such symbol: " + x)
        return scope[x]
      }

      return x
    }
  }
}

assert(evalǃ({})(3) === 3)
assert(evalǃ({ a: 7 })("a") === 7)
assert(evalǃ(core)(["+", [2, [3, null]]]) === 5)

const tst = s => evalǃ({ ...core })(read(s))
assert(tst("(+ 5 7)") === 12)

assert(tst("(lambda (x) (+ x x))")[0] === "lambda")
assert(length(tst("(lambda (x) (+ x x))")) === 4)
assert(tst("((lambda (x) (+ x x)) 3)") === 6)
assert(tst("((lambda (x y) y) 3 5)") === 5)
assert(JSON.stringify(tst("((lambda x x) 2 3 5)")) === "[2,[3,[5,null]]]")
assert(tst("((lambda (x y . z) x) 1 2 3 4 5)") === 1)
assert(tst("((lambda (x y . z) y) 1 2 3 4 5)") === 2)
assert(
  JSON.stringify(tst("((lambda (x y . z) z) 1 2 3 4 5)")) === "[3,[4,[5,null]]]"
)

assert(tst("(if 0 1 2)") === 1)
assert(tst("(if () 1 2)") === 2)

assert(tst("(define x 10)") === "x")
const t = { ...core }
assert(evalǃ(t)(read("(define x 11)")) === "x")
assert(t.x === 11)

assert(tst("(quote a)") === "a")

module.exports = evalǃ
