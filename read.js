const { assert, identity } = require("./lang.js")

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

      return r[1]
    }

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

assert(read("3") === 3, 3)
assert(read("hello") === "hello")
assert(JSON.stringify(read("(1 (a) 3)")) === `[1,[["a",null],[3,null]]]`)
assert(read("()") === null)
assert(JSON.stringify(read("(1 2 . 3)")) === "[1,[2,3]]")
assert(JSON.stringify(read("(1 . (2 . (3 . ())))")) === "[1,[2,[3,null]]]")

module.exports = read
