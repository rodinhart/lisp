const fs = require("fs")

const compile = require("./src/compile.js")
const { fold } = require("./src/ISeq.js")
const { thread } = require("./src/lang.js")
const { car, cdr, isCons } = require("./src/list.js")
const macroexpand = require("./src/macroexpand.js")
const primitive = require("./src/primitive.js")
const sandbox = require("./src/sandbox.js")
const read = require("./src/read.js")

const CORE = false

const core = CORE ? {} : require("./dist/core.clj.aot.js")

const aot = (source, env, target, noeval) =>
  thread(source, [
    fs.readFileSync,
    s => read(`(${s})`),
    x =>
      fold(
        (r, exp) => {
          if (isCons(exp) && car(exp) === Symbol.for("import")) {
            const name = Symbol.keyFor(car(cdr(exp)))
            const path = Symbol.keyFor(car(cdr(cdr(exp)))).replace(/\.\//, "")

            if (path.match(/.js$/)) {
              // env[name] = require(`./app/${path}`)
              r.push(`env["${name}"] = require("../app/${path}")`)

              return r
            }

            env[name] = aot(
              `./app/${path}`,
              { ...primitive, ...core },
              `./dist/${path}.aot.js`
            )

            r.push(`env["${name}"] = require("${`./${path}.aot.js`}")`)

            return r
          }

          const expanded = macroexpand(exp, env)
          const code = compile(expanded, {})
          if (!noeval) sandbox(code, env)

          r.push(code)
          return r
        },
        [
          `const core = require("./core.clj.aot.js")`,
          `const primitive = require("../src/primitive.js")`,
          `const env = {...primitive, ...core}`
        ],
        x
      ),
    x => x.concat([`module.exports = env`]),
    x => x.join("\n"),
    x => fs.writeFileSync(target, x),
    () => env
  ])

if (CORE) {
  aot("./src/core.clj", { ...primitive }, "./dist/core.clj.aot.js")
} else {
  aot(
    "./app/index.clj",
    { ...primitive, ...core },
    "./dist/index.clj.aot.js",
    true
  )
}
