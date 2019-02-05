const IIterable = x => {
  if (x) {
    if (x[Symbol.iterator]) return x

    if (typeof x === "object" && x.constructor === Object) {
      return Object.entries(x)
    }
  }

  throw new Error("Failed to get IIterable for ${x}")
}

const fold = (fn, init, iter) => {
  let r = init
  for (const val of iter) {
    r = fn(r, val)
  }

  return r
}

const map = (fn, iter) => ({
  [Symbol.iterator]: function*() {
    for (const val of iter) {
      yield fn(val)
    }
  }
})

module.exports = {
  IIterable,
  fold,
  map
}
