const { EMPTY, isCons } = require("./list.js")

const seqArray = (xs, i) =>
  i < xs.length
    ? {
        first: () => xs[i],
        rest: () => seqArray(xs, i + 1)
      }
    : null

const getSeq = x => {
  if (x === null || x === EMPTY) return null

  if (typeof x.first === "function" && typeof x.rest === "function") return x

  if (x instanceof Array) return seqArray(x, 0)

  throw new Error(`Failed to get ISeq for ${x}`)
}

const first = x => getSeq(x).first()
const rest = x => getSeq(x).rest()
const isEmpty = x => getSeq(x) === null

const Seq = (first, rest) => ({
  first,
  rest,
  toString: () => "[Seq]",
  [Symbol.iterator]: function*() {
    yield first()
    const c = rest()
    if (!c) return
    for (const val of c) {
      yield val
    }
  }
})

module.exports = {
  first,
  getSeq,
  isEmpty,
  rest,
  Seq
}
