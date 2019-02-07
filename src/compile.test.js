const compile = require("./compile.js")
const read = require("./read.js")

const ENV = "env" // see compile.js

test("compile", () => {
  expect(compile(null, {})).toEqual(null)
  expect(compile(42, {})).toEqual(42)
  expect(compile("x", { x: true })).toEqual("x")
  expect(compile("y", {})).toEqual(`${ENV}["y"]`)

  expect(compile(read("(lambda (x y) (f y x))"), { f: true })).toEqual(
    "((x, y) => (f)(y, x))"
  )
  expect(compile(read("(lambda x x)"), {})).toEqual("((...x) => x)")
  expect(compile(read("(lambda () 42)"), {})).toEqual("(() => 42)")

  expect(compile(read("(if x 42 (f 1 2))"), { x: true, f: true })).toEqual(
    "((x) ? (42) : ((f)(1, 2)))"
  )

  expect(compile(read("(define x 42)"), {})).toEqual(`${ENV}["x"] = (42), "x"`)

  expect(compile(read("(quote (1 (add 1 1)))"), { add: true })).toEqual(
    `${ENV}["cons"](1, ${ENV}["cons"](${ENV}["cons"]("add", ${ENV}["cons"](1, ${ENV}["cons"](1, ${ENV}["EMPTY"]))), ${ENV}["EMPTY"]))`
  )

  expect(compile(read("(f x y)"), { f: true, x: true, y: true })).toEqual(
    "(f)(x, y)"
  )
})
