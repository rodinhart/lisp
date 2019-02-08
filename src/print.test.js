const { EMPTY, Cons } = require("./list.js")
const prn = require("./print.js")

test("prn", () => {
  expect(prn(undefined)).toEqual("undefined")
  expect(prn(null)).toEqual("null")
  expect(prn(false)).toEqual("false")
  expect(prn(true)).toEqual("true")
  expect(prn(3)).toEqual("3")
  expect(prn("hello")).toEqual(`"hello"`)
  expect(prn(Symbol.for("fn"))).toEqual("fn")

  expect(prn(EMPTY)).toEqual("()")
  expect(prn(Cons(2, Cons(3, Cons(5, EMPTY))))).toEqual("(2 3 5)")
  expect(prn(Cons(1, 2))).toEqual("(1 . 2)")

  expect(prn([1, 2, 3])).toEqual("[1 2 3]")
  expect(prn([1, [2, null]])).toEqual("[1 [2 null]]")

  expect(prn(x => x)).toEqual("[procedure]")

  expect(prn({ a: 1, b: EMPTY })).toEqual(`{"a" 1 "b" ()}`)
})
