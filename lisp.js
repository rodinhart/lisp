const fs = require("fs")

// separate tests
// add ' to reader
// refactor function and macro application
// make prn pretty print multiline
// scope with parent for easier printing?

const { thread } = require("./lang.js")
const { fold } = require("./list.js")
const read = require("./read.js")
const prn = require("./print.js")
const evalǃ = require("./eval.js")
const macroexpand = require("./macroexpand.js")
const core = require("./core.js")

thread(
  String(fs.readFileSync("./core.clj")),
  read,
  fold((r, x) => {
    // console.log("\nx", prn(x))
    const ex = macroexpand(core)(x)
    // console.log("y", prn(ex))

    return evalǃ(core)(ex)
  }, null),
  prn,
  console.log
)
