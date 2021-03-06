const { EMPTY } = require("./list.js")
const prn = require("./print.js")
const read = require("./read.js")

test("read", () => {
  expect(read("; ignore me\n42")).toEqual(42)

  expect(read("undefined")).toEqual(undefined)
  expect(read("null")).toEqual(null)
  expect(read("false")).toEqual(false)
  expect(read("true")).toEqual(true)
  expect(read("4")).toEqual(4)
  expect(read("42")).toEqual(42)
  expect(read("-2")).toEqual(-2)
  expect(() => read("-2-")).toThrow(/Invalid number/)
  expect(prn(read("(- 4 1)"))).toEqual("(- 4 1)")
  expect(read("3.1415")).toEqual(3.1415)
  expect(read(`"hello"`)).toEqual("hello")
  expect(read("hello")).toEqual(Symbol.for("hello"))

  expect(read("()")).toEqual(EMPTY)
  expect(String(read("(1 2)"))).toEqual("(1 . (2 . ()))")
  expect(String(read("(1 2 . 3)"))).toEqual("(1 . (2 . 3))")
  expect(() => read("(1 2 . 3 4)")).toThrow(/Expected \)/)
  expect(String(read(`(1 ("a") 3)`))).toEqual(`(1 . ((a . ()) . (3 . ())))`)

  expect(JSON.stringify(read(`[1 2 "a" "b"]`))).toEqual(`[1,2,"a","b"]`)

  expect(prn(read("{a 1 b true}"))).toEqual("(object a 1 b true)")
  expect(() => read("{a 1 b}")).toThrow(/Expected pairs/)

  expect(prn(read("`x"))).toEqual("(quote x)")
  expect(prn(read("`()"))).toEqual("()")
  expect(prn(read("`(x y z)"))).toEqual("(list (quote x) (quote y) (quote z))")
  expect(prn(read("`(x y ~z)"))).toEqual("(list (quote x) (quote y) z)")
  // expect(prn(read("`((x y) ~z)"))).toEqual("(list (quote (x y)) z)")

  expect(prn(read("`{a 1 ~b 2}"))).toEqual(
    "(object (quote a) (quote 1) b (quote 2))"
  )
  expect(prn(read("`[a ~b]"))).toEqual("[(quote a) b]")

  expect(prn(read(`(.log js/console "Hello world")`))).toEqual(
    '(.log js/console "Hello world")'
  )
  expect(prn(read(`(import core ../core.clj)`))).toEqual(
    "(import core ../core.clj)"
  )
})
