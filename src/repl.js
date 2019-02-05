const readline = require("readline")

const compile = require("./compile.js")
const { thread } = require("./lang.js")
const macroexpand = require("./macroexpand.js")
const primitive = require("./primitive.js")
const prn = require("./print.js")
const read = require("./read.js")
const sandbox = require("./sandbox.js")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const env = { ...primitive }

const _ = () => {
  console.log()
  rl.question("    ", r => {
    thread(r, [
      read,
      exp => {
        const expanded = macroexpand(exp, env)
        const code = compile(expanded, {})
        // console.log(code)
        return sandbox(code, env)
      },
      prn,
      console.log
    ])

    _()
  })
}

_()
