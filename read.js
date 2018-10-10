const { assert, identity } = require("./lang.js")
const { Cons } = require("./list.js")

const toCons = x => (x instanceof Array ? Cons(x[0], toCons(x[1])) : x)

const read = s => {
  const _ = x => {
    if (!x.length) return null
    const f = x.shift()
    if (f === "(") {
      const r = [null, null]
      let c = r
      while (x.length && x[0] !== "." && x[0] !== ")") {
        c[1] = [_(x), null]
        c = c[1]
      }

      if (x[0] === ".") {
        x.shift()
        c[1] = _(x)
      }

      if (x.shift() !== ")") throw new Error("Missing )")

      return toCons(r[1])
    }

    if (f === "nil") return null

    return String(Number(f)) === f ? Number(f) : f
  }

  return _(
    s
      .replace(/\r/g, "")
      .replace(/(;.*\n)/g, "\n")
      .replace(/(\(|\))/g, " $1 ")
      .split(/\s/)
      .filter(identity)
  )
}

assert(read("()") === null)
assert(read("3") === 3, 3)
assert(read("hello") === "hello")

assert(String(read("(1 2)")) === "(1 . (2 . nil))")
assert(String(read("(1 2 . 3)")) === "(1 . (2 . 3))")
assert(String(read("(1 (a) 3)")) === "(1 . ((a . nil) . (3 . nil)))")

module.exports = read
