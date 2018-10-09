const assert = b => {
  if (b !== true) throw new Error("Assertion failed. " + b)
}

const identity = x => x

// TODO thread(a, [f, g])
const thread = (x, ...fs) => fs.reduce((x, f) => f(x), x)

module.exports = {
  assert,
  identity,
  thread
}
