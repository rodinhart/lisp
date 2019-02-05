const { EMPTY, Cons } = require("./list.js")
const prn = require("./print.js")

test("prn", () => {
  expect(prn(null)).toEqual("nil")
  expect(prn(3)).toEqual("3")
  expect(prn("a")).toEqual("a")

  expect(prn(Cons(2, Cons(3, Cons(5, EMPTY))))).toEqual("(2 3 5)")
  expect(prn(Cons(1, 2))).toEqual("(1 . 2)")

  expect(prn([1, 2, 3])).toEqual("[1,2,3]")
  expect(prn([1, [2, null]])).toEqual("[1,[2,nil]]")
})
