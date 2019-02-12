const { EMPTY } = require("./list.js")

const seqArray = (xs, i) =>
  i < xs.length
    ? {
        first: () => xs[i],
        rest: () => seqArray(xs, i + 1)
      }
    : null

const ISeq = x => {
  if (x === null || x === EMPTY) return null

  if (typeof x.first === "function" && typeof x.rest === "function") return x

  if (x instanceof Array) return seqArray(x, 0)

  throw new Error(`Failed to get ISeq for ${x}`)
}

const first = x => ISeq(x).first()
const rest = x => ISeq(x).rest()
const isEmpty = x => ISeq(x) === null

const Seq = (first, rest) => ({
  first,
  rest,
  toString: () => "[Seq]",
  [Symbol.iterator]: function*() {
    let seq = Seq(first, rest)
    while (seq !== null) {
      yield seq.first()
      seq = seq.rest()
    }
  }
})

// fold :: (r -> a -> r) -> r -> ISeq a -> r
const fold = (f, init, xs) => {
  let r = init
  let c = ISeq(xs)
  let cnt = 0
  while (!isEmpty(c) && ++cnt < 100) {
    r = f(r, first(c))
    c = rest(c)
  }

  return r
}

// map :: (a -> b) -> ISeq a -> ISeq b
const map = (f, xs) =>
  isEmpty(xs) ? null : Seq(() => f(first(xs)), () => map(f, rest(xs)))

module.exports = {
  first,
  fold,
  isEmpty,
  ISeq,
  map,
  rest,
  Seq
}
