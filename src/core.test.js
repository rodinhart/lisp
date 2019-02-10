const fs = require("fs")
const lisp = require("./lisp.js")
const prn = require("./print.js")

const { concat, destruct, flatten, list } = lisp(
  {},
  fs.readFileSync(require.resolve("./core.scm"))
)

test("list", () => {
  expect(prn(list(2, 3, 5))).toEqual("(2 3 5)")
})

test("concat", () => {
  expect(prn(concat(list(1, 2), list(3, 4)))).toEqual("(1 2 3 4)")
})

test("destruct", () => {
  expect(prn(destruct(list(list(Symbol.for("x"))), Symbol.for("t")))).toEqual(
    "((first (first t)))"
  )
})

test("flatten", () => {
  expect(prn(flatten(list(list(Symbol.for("x"), Symbol.for("y")))))).toEqual(
    "(x y)"
  )
})
