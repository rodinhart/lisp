const fs = require("fs")

const compile = require("./compile.js")
const { thread } = require("../lang.js")
const { fold } = require("../list.js")
const read = require("../read.js")
const prn = require("../print.js")

const add = (...xs) => xs.reduce((r, x) => r + x, 0)
const sub = (x, y) => x - y
const gt = (x, y) => x > y

thread(
  // String(fs.readFileSync("./core.clj")),
  `

  (for
    (n 100000 a 0)
    (gt n 0)
    ((sub n 1) (add a 1))
    a
  )


  `,
  s => `(${s})`,
  read,

  fold((r, x) => {
    const code = compile(x)
    return eval(code)
  }, null),
  prn,

  console.log
)
