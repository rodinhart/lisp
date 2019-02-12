const compile = require("./compile.js")
const { EMPTY } = require("./list.js")
const primitive = require("./primitive.js")
const read = require("./read.js")
const sandbox = require("./sandbox.js")

const ENV = "env" // see compile.js

test("compile", () => {
  expect(compile(undefined, {})).toEqual("undefined")
  expect(compile(null, {})).toEqual("null")
  expect(compile(false)).toEqual("false")
  expect(compile(true)).toEqual("true")
  expect(compile(42, {})).toEqual("42")
  expect(compile("hello", {})).toEqual(`"hello"`)

  expect(compile(Symbol.for("x"), { x: true })).toEqual("x")
  expect(compile(Symbol.for("y"), {})).toEqual(`${ENV}["y"]`)

  expect(compile(read(`[2 3 5 x]`), {})).toEqual(`[2,3,5,env["x"]]`)

  expect(compile({ a: 1, b: 2, c: EMPTY })).toEqual(
    `{"a":1,"b":2,"c":env["EMPTY"]}`
  )

  expect(compile(EMPTY)).toEqual(`env["EMPTY"]`)
  expect(compile(read("(lambda (x y) (f y x))"), { f: true })).toEqual(
    "((x,y) => (f)(y,x))"
  )
  expect(compile(read("(lambda x x)"), {})).toEqual("((...x) => x)")
  expect(compile(read("(lambda () 42)"), {})).toEqual("(() => 42)")

  expect(compile(read("(if x 42 (f 1 2))"), { x: true, f: true })).toEqual(
    "((x) ? (42) : ((f)(1,2)))"
  )

  expect(compile(read("(define x 42)"), {})).toEqual(`${ENV}["x"] = (42), "x"`)

  expect(
    sandbox(
      compile(
        read(`
    (loop (x 1 r 1)
      (if (< x 5)
        (recur (+ x 1) (* r x))
        r))`)
      ),
      { ...primitive }
    )
  ).toEqual(24)

  expect(compile(read(`(quote (1 (add 1 1)))`), { add: true })).toEqual(
    `${ENV}["cons"](1, ${ENV}["cons"](${ENV}["cons"](Symbol.for("add"), ${ENV}["cons"](1, ${ENV}["cons"](1, ${ENV}["EMPTY"]))), ${ENV}["EMPTY"]))`
  )

  expect(compile(read("(f x y)"), { f: true, x: true, y: true })).toEqual(
    "(f)(x,y)"
  )

  expect(
    compile(read("(.prop obj x y)"), { obj: true, x: true, y: true })
  ).toEqual(`obj["prop"](x,y)`)
})
