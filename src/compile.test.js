const compile = require("./compile.js")
const { thread } = require("./lang.js")
const { EMPTY } = require("./list.js")
const primitive = require("./primitive.js")
const print = require("./print.js")
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
    `((x,y) => ((f)(y,x)))`
  )
  expect(compile(read("(lambda x x)"), {})).toEqual("((...x) => (x))")
  expect(compile(read("(lambda () 42)"), {})).toEqual("(() => (42))")
  expect(
    compile(read(`(lambda (x) (log "double") (* 2 x))`), {
      log: true,
      "*": true
    })
  ).toEqual(`((x) => ((log)("double"),(*)(2,x)))`)

  expect(compile(read("(if x 42 (f 1 2))"), { x: true, f: true })).toEqual(
    `((x) ? (42) : ((f)(1,2)))`
  )

  expect(compile(read("(if 1 2)"), {})).toEqual("((1) ? (2) : (undefined))")

  expect(compile(read("(define x 42)"), {})).toEqual(
    `${ENV}["x"] = (42), Symbol.for("x")`
  )

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

  expect(
    thread("`(x y ~z)", [
      read,
      x => compile(x, {}),
      x => sandbox(x, { ...primitive, z: 42 }),
      print
    ])
  ).toEqual("(x y 42)")

  expect(
    thread("`[a 1 ~b 3]", [
      read,
      x => compile(x, {}),
      x => sandbox(x, { ...primitive, a: 10, b: 2 }),
      print
    ])
  ).toEqual("[a 1 2 3]")

  expect(
    thread("`{a 1 ~b 3}", [
      read,
      x => compile(x, {}),
      x => sandbox(x, { ...primitive, a: 10, b: 2 }),
      print
    ])
  ).toEqual(`{"2" 3 "a" 1}`)

  expect(
    thread("`(a ~(car (cdr `(b ~c))))", [
      read,
      x => compile(x, {}),
      x => sandbox(x, { ...primitive, c: 42 }),
      print
    ])
  ).toEqual("(a 42)")

  expect(compile(read("(f x y)"), { f: true, x: true, y: true })).toEqual(
    `(f)(x,y)`
  )

  expect(
    compile(read("(f x y . z)"), {
      f: true,
      x: true,
      y: true,
      z: true
    })
  ).toEqual(`(f)(x,y,...(z))`)

  expect(
    compile(read("(.prop obj x y)"), { obj: true, x: true, y: true })
  ).toEqual(`obj["prop"](x,y)`)

  expect(compile(read("(.prop obj . xs)"), { obj: true, xs: true })).toEqual(
    `obj["prop"](...(xs))`
  )

  // expect(
  //   thread(`("foo" {"foo" "hello"})`, [
  //     read,
  //     x => compile(x, { x: true }),
  //     x => sandbox(x, { ...primitive })
  //   ])
  // ).toEqual("hello")

  // expect(
  //   thread(`({"foo" "world"} "foo")`, [
  //     read,
  //     x => compile(x, { x: true }),
  //     x => sandbox(x, { ...primitive })
  //   ])
  // ).toEqual("world")

  // expect(
  //   thread(`([1 2 3 4] 2)`, [
  //     read,
  //     x => compile(x, { x: true }),
  //     x => sandbox(x, { ...primitive })
  //   ])
  // ).toEqual(3)
})
