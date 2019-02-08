const { Cons, EMPTY } = require("./list.js")

// needed to convert array tuples to proper Cons
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

    if (f === "{") {
      const r = [Symbol.for("object"), EMPTY]
      let c = r
      while (x.length && x[0] !== "}") {
        c[1] = [_(x), EMPTY]
        c = c[1]
      }

      if (x.shift() !== "}") throw new Error("Missing }")

      return toCons(r)
    }

    if (f === "undefined") return undefined
    if (f === "null") return null
    if (f === "false") return false
    if (f === "true") return true

    if (String(Number(f)) === f) return Number(f)

    if (f[0] === `"`) return f.substr(1, f.length - 2)

    return Symbol.for(f)
  }

  return _(
    s
      .replace(/\r/g, "")
      .replace(/(;.*\n)/g, "\n")
      .replace(/,/g, " ")
      .replace(/(\(|\)|\[|\]|\{|\})/g, " $1 ")
      .split(/\s/)
      .filter(x => !!x)
  )
}

module.exports = read
