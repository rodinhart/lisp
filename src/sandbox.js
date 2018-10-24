const {
  EMPTY,
  car,
  cdr,
  cons,
  first,
  isEmpty,
  rest,
  Seq,
  isAtom,
  add,
  gt,
  sub
} = require("./primitive.js")

const sandbox = (x, env) => {
  const module = {
    exports: env
  }
  try {
    return eval(x)
  } catch (e) {
    console.log(x)
    throw e
  }
}

module.exports = sandbox
