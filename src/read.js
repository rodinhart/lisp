const { EMPTY, car, cdr, Cons, isCons } = require("./list.js")

// needed to convert array tuples to proper Cons
const toCons = x => (x instanceof Array ? Cons(x[0], toCons(x[1])) : x)

/**
 *
 * @param {string} s
 */
const read = s => {
  let i = 0

  const isTerm = c => c.match(/\s/) || c === ")" || c === "]" || c === "}"

  const readWS = () => {
    while (i < s.length && s[i].match(/\s/)) i += 1
  }

  const readComment = () => {
    while (i < s.length && s[i] !== "\n") i += 1
  }

  const readNumber = () => {
    let b = ""
    while (i < s.length && !isTerm(s[i])) {
      b += s[i]
      i += 1
    }

    const r = Number(b)
    if (String(r) !== b) throw Error(`Invalid number ${b}`)

    return Number(b)
  }

  const readString = () => {
    let b = ""
    i += 1
    while (i < s.length && s[i] !== '"') {
      b += s[i]
      i += 1
    }

    if (s[i] !== '"') throw new Error(`Expected quote at ${i}`)
    i += 1

    return b
  }

  const readList = () => {
    const r = [null, EMPTY]
    let c = r

    i += 1
    readWS()
    while (i < s.length && s[i] !== ")") {
      const t = readExpr()
      if (t === Symbol.for(".")) {
        readWS()
        c[1] = readExpr()
        readWS()
        break
      } else {
        c[1] = [t, EMPTY]
        c = c[1]
      }

      readWS()
    }
    if (s[i] !== ")") throw new Error(`Expected ) at ${i}`)
    i += 1

    return toCons(r[1])
  }

  const readArray = () => {
    const r = []
    i += 1
    readWS()
    while (i < s.length && s[i] !== "]") {
      r.push(readExpr())
      readWS()
    }

    if (s[i] !== "]") throw new Error(`Expected ] at ${i}`)

    return r
  }

  const readObject = () => {
    const r = [null, [Symbol.for("object"), EMPTY]]
    let c = r[1]
    let count = 0

    i += 1
    readWS()
    while (i < s.length && s[i] !== "}") {
      c[1] = [readExpr(), EMPTY]
      c = c[1]
      count += 1
      readWS()
    }

    if (count % 2) throw new Error(`Expected pairs at ${i}`)

    if (s[i] !== "}") throw new Error(`Expected } at ${i}`)
    i += 1

    return toCons(r[1])
  }

  const readSyntax = () => {
    i += 1
    const t = readExpr()

    if (t === EMPTY) return EMPTY

    const quote = x => Cons(Symbol.for("quote"), Cons(x, EMPTY))

    if (t instanceof Array) {
      return t.map(x =>
        isCons(x) && car(x) === Symbol.for("unquote") ? car(cdr(x)) : quote(x)
      )
    }

    if (!isCons(t)) return quote(t)

    const map = xs => {
      if (xs === EMPTY) return EMPTY

      const x = car(xs)
      if (isCons(x) && car(x) === Symbol.for("unquote")) {
        return Cons(car(cdr(x)), map(cdr(xs)))
      }

      return Cons(quote(x), map(cdr(xs)))
    }

    return car(t) === Symbol.for("object")
      ? Cons(Symbol.for("object"), map(cdr(t)))
      : Cons(Symbol.for("list"), map(t))
  }

  const readUnquote = () => {
    i += 1

    return Cons(Symbol.for("unquote"), Cons(readExpr(), EMPTY))
  }

  const readSymbol = () => {
    let b = ""
    while (i < s.length && !isTerm(s[i])) {
      b += s[i]
      i += 1
    }

    if (b === "undefined") return undefined
    if (b === "null") return null
    if (b === "false") return false
    if (b === "true") return true

    return Symbol.for(b)
  }

  const readExpr = () => {
    readWS()
    if (i >= s.length) throw new Error(`Expected expression at ${i}`)

    const c = s[i]
    if (c === ";") {
      readComment()
      return readExpr()
    } else if ((c >= "0" && c <= "9") || c === "-") {
      return readNumber()
    } else if (c === '"') {
      return readString()
    } else if (c === "(") {
      return readList()
    } else if (c === "[") {
      return readArray()
    } else if (c === "{") {
      return readObject()
    } else if (c === "`") {
      return readSyntax()
    } else if (c === "~") {
      return readUnquote()
    } else {
      return readSymbol()
    }
  }

  return readExpr(0)
}

module.exports = read
