const { first, isEmpty, rest } = require("./ISeq.js")
const { EMPTY, car, cdr, cons } = require("./list.js")

const isAtom = x => typeof x !== "object"
const add = (...xs) => xs.reduce((a, b) => a + b, 0)
const sub = (...xs) => xs[0] - xs[1]
const gt = (...xs) => xs[0] > xs[1]

const sandbox = x => eval(x)

module.exports = sandbox
