const IIterable = x => {
  if (
    x &&
    typeof x === "object" &&
    x.constructor === Object &&
    !x[Symbol.iterator]
  ) {
    return Object.entries(x)
  }

  if (x && x[Symbol.iterator]) return x

  throw new Error("Failed to get IIterable for ${x}")
}

module.exports = {
  IIterable
}
