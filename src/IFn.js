const IFn = x => {
  if (typeof x === "function") return x

  if (typeof x === "string") return obj => obj[x]

  if (x && typeof x === "object") return key => x[key]

  throw new Error(`Failed to get IFn for ${x}`)
}

module.exports = {
  IFn
}
