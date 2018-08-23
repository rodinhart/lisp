const { assert } = require("./lang.js")

const prn = x => {
  if (x instanceof Array) {
    const r = []
    while (x !== null) {
      if (x instanceof Array) {
        r.push(prn(x[0]))
        x = x[1]
      } else {
        r.push(".")
        r.push(prn(x))
        x = null
      }
    }
    return `(${r.join(" ")})`
  } else if (x && typeof x === "object") {
    return `{${Object.entries(x)
      .filter(
        ([key, val]) =>
          !val || (typeof val !== "object" && typeof val !== "function")
      )
      .map(([key, val]) => `${key}: ${val}`)
      .join(", ")}}`
  }

  return x === null ? "()" : String(x)
}

assert(prn(3) === "3")
assert(prn("a") === "a")
assert(prn([1, [2, [["a", null], null]]]) === "(1 2 (a))")
assert(prn(null) === "()")
assert(prn([1, 2]) === "(1 . 2)")
assert(prn([1, [[2, 3], 4]]) === "(1 (2 . 3) . 4)")

module.exports = prn
