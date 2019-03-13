const { EMPTY, Cons } = require("./list.js")

const seqArray = (xs, i) =>
  i < xs.length
    ? {
        first: () => xs[i],
        rest: () => ({
          [Symbol.for("ISeq")]: seqArray(xs, i + 1)
        }),
        [Symbol.iterator]: function*() {
          for (let j = i; j < xs.length; j += 1) {
            yield xs[j]
          }
        }
      }
    : EMPTY

const ISeq = x => {
  if (x === EMPTY) return EMPTY

  if (x && x[Symbol.for("ISeq")]) return x[Symbol.for("ISeq")]

  if (x instanceof Array) return seqArray(x, 0)

  if (typeof x === "object" && x.constructor === Object) {
    return seqArray(Object.entries(x), 0)
  }

  throw new Error(`Failed to get ISeq for ${x}`)
}

const first = x => ISeq(x).first()
const rest = x => ISeq(x).rest()
const isEmpty = x => ISeq(x) === EMPTY

const Seq = (_first, _rest) => ({
  [Symbol.for("ISeq")]: {
    first: _first,
    rest: _rest
  },
  toString: () => "[Seq]",
  [Symbol.iterator]: function*() {
    let seq = Seq(_first, _rest)
    while (!isEmpty(seq)) {
      yield first(seq)
      seq = rest(seq)
    }
  }
})

// fold :: (r -> a -> r) -> r -> ISeq a -> r
const fold = (f, init, xs) => {
  let r = init
  let c = xs
  while (!isEmpty(c)) {
    r = f(r, first(c))
    c = rest(c)
  }

  return r
}

// map :: (a -> b) -> ISeq a -> ISeq b
const map = (f, xs) =>
  isEmpty(xs) ? EMPTY : Seq(() => f(first(xs)), () => map(f, rest(xs)))

// toList :: ISeq a -> List a
const toList = xs => (isEmpty(xs) ? EMPTY : Cons(first(xs), toList(rest(xs))))

module.exports = {
  first,
  fold,
  isEmpty,
  ISeq,
  map,
  rest,
  Seq,
  toList
}
