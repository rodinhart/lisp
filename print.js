const { assert } = require("./lang.js")
const { car, cdr, Cons, EMPTY, isCons } = require("./list.js")

const prn = x => {
  if (x === null) return "nil"

  if (isCons(x)) {
    const r = []
    while (x !== EMPTY) {
      if (isCons(x)) {
        r.push(prn(car(x)))
        x = cdr(x)
      } else {
        r.push(".")
        r.push(prn(x))
        x = EMPTY
      }
    }

    return `(${r.join(" ")})`
  }

  if (x instanceof Array) {
    return `[${x.map(prn).join(",")}]`
  }

  if (x && typeof x.first === "function" && typeof x.rest === "function") {
    const r = []
    while (x) {
      r.push(prn(x.first()))
      x = x.rest()
    }

    return `(${r.join(" ")})`
  }

  // if (x && typeof x === "object") {
  //   return `{${Object.entries(x)
  //     .filter(
  //       ([key, val]) =>
  //         !val || (typeof val !== "object" && typeof val !== "function")
  //     )
  //     .map(([key, val]) => `${key}: ${val}`)
  //     .join(", ")}}`
  // }

  return String(x)
}

assert(prn(null) === "nil")
assert(prn(3) === "3")
assert(prn("a") === "a")

assert(prn(Cons(2, Cons(3, Cons(5, EMPTY)))) === "(2 3 5)")
assert(prn(Cons(1, 2)) === "(1 . 2)")

assert(prn([1, [2, null]]) === "[1,[2,nil]]")

module.exports = prn
