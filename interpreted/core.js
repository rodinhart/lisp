const { fold } = require("../list.js")
const prn = require("../print.js")

const core = {
  lambda: "LAMBDA",
  if: "IF",
  define: "DEFINE",
  quote: "QUOTE",
  macro: "MACRO",
  time: "TIME", // temp

  "+": scope => fold((r, x) => r + x, 0),
  "-": scope => xs => xs[0] - xs[1][0],
  "*": scope => fold((r, x) => r * x, 1),
  ">": scope => xs => (xs[0] > xs[1][0] ? 1 : null),
  "atom?": scope => x => (x[0] instanceof Array ? null : 1),
  car: scope => xs => xs[0][0],
  cdr: scope => xs => xs[0][1],
  cons: scope => xs => [xs[0], xs[1][0]],
  prn: scope => xs => console.log(prn(xs[0])) || null
}

module.exports = core
