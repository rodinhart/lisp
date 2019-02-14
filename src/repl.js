const fs = require("fs")
const readline = require("readline")

const compile = require("./compile.js")
const { thread } = require("./lang.js")
const lisp = require("./lisp.js")
const macroexpand = require("./macroexpand.js")
const primitive = require("./primitive.js")
const prn = require("./print.js")
const read = require("./read.js")
const sandbox = require("./sandbox.js")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const env = {
  ...primitive,
  ...lisp({ ...primitive }, fs.readFileSync("./src/core.clj"))
}

const _ = pre => {
  console.log()
  rl.question("    ", r => {
    try {
      read(pre + r)
    } catch (e) {
      _(pre + r)
      return
    }

    thread(pre + r, [
      read,
      exp => {
        const expanded = macroexpand(exp, env)
        //console.log(prn(expanded))
        const code = compile(expanded, {})
        //console.log(code)
        return sandbox(code, env)
      },
      prn,
      console.log
    ])

    _("")
  })
}

_("")
