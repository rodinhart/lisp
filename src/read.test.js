const { EMPTY } = require("./list.js")
const prn = require("./print.js")
const read = require("./read.js")

test("read", () => {
  expect(read("undefined")).toEqual(undefined)
  expect(read("null")).toEqual(null)
  expect(read("false")).toEqual(false)
  expect(read("true")).toEqual(true)
  expect(read("3")).toEqual(3)
  expect(read(`"hello"`)).toEqual("hello")
  expect(read("hello")).toEqual(Symbol.for("hello"))

  expect(read("()")).toEqual(EMPTY)
  expect(String(read("(1 2)"))).toEqual("(1 . (2 . ()))")
  expect(String(read("(1 2 . 3)"))).toEqual("(1 . (2 . 3))")
  expect(String(read(`(1 ("a") 3)`))).toEqual(`(1 . ((a . ()) . (3 . ())))`)

  expect(JSON.stringify(read(`[1 2 "a" "b"]`))).toEqual(`[1,2,"a","b"]`)

  expect(prn(read("{a 1 b true}"))).toEqual("(object a 1 b true)")

  expect(prn(read("`x"))).toEqual("(syntax x)")
  expect(prn(read("`(x y z)"))).toEqual("(syntax (x y z))")
  expect(prn(read("`(x y ~z)"))).toEqual("(syntax (x y (unquote z)))")
})
