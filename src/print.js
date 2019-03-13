const { car, cdr, EMPTY, isCons } = require("./list.js")

const prn = x => {
  if (x === undefined || x === null) return String(x)

  if (typeof x === "boolean" || typeof x === "number") return String(x)
  if (typeof x === "symbol") return Symbol.keyFor(x)
  if (typeof x === "string") return `"${x}"`

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
    return `[${x.map(prn).join(" ")}]`
  }

  if (x && x[Symbol.for("ISeq")]) {
    return `(${[...x].map(prn).join(" ")})`
  }

  if (typeof x === "function") {
    return x.macro ? "[macro]" : "[procedure]"
  }

  return `{${Object.entries(x)
    .map(([key, val]) => `"${key}" ${prn(val)}`)
    .join(" ")}}`
}

module.exports = prn
