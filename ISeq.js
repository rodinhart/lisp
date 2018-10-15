const { isCons } = require("./list.js")

const seqArray = (xs, i) =>
  i < xs.length
    ? {
        first: () => xs[i],
        rest: () => seqArray(xs, i + 1)
      }
    : null

const getSeq = x => {
  if (x === null) return null

  if (typeof x.first === "function" && typeof x.rest === "function") return x

  if (x instanceof Array) return seqArray(x, 0)

  if (isCons(x)) return null // Empty cons

  throw new Error(`Failed to get ISeq for ${x}`)
}

const first = x => getSeq(x).first()
const rest = x => getSeq(x).rest()

module.exports = {
  first,
  getSeq,
  rest
}
