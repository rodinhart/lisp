const IIterable = x => {
  if (x) {
    if (x[Symbol.iterator]) return x

    if (typeof x === "object" && x.constructor === Object) {
      return Object.entries(x)
    }
  }

  throw new Error("Failed to get IIterable for ${x}")
}

module.exports = {
  IIterable
}
