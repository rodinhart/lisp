const { Cons, EMPTY } = require("./list.js")

const toCons = x => (x instanceof Array ? Cons(x[0], toCons(x[1])) : x)

const read = s => {
  const _ = x => {
    if (!x.length) return null
    const f = x.shift()
    if (f === "(") {
      const r = [null, EMPTY]
      let c = r
      while (x.length && x[0] !== "." && x[0] !== ")") {
        c[1] = [_(x), EMPTY]
        c = c[1]
      }

      if (x[0] === ".") {
        x.shift()
        c[1] = _(x)
      }

      if (x.shift() !== ")") throw new Error("Missing )")

      return toCons(r[1])
    }

    if (f === "[") {
      const r = []
      while (x.length && x[0] !== "]") {
        r.push(_(x))
      }

      if (x.shift() !== "]") throw new Error("Missing ]")

      return r
    }

    if (f === "nil") return null

    return String(Number(f)) === f ? Number(f) : f
  }

  return _(
    s
      .replace(/\r/g, "")
      .replace(/(;.*\n)/g, "\n")
      .replace(/(\(|\)|\[|\])/g, " $1 ")
      .split(/\s/)
      .filter(x => !!x)
  )
}

module.exports = read
