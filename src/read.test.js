const { EMPTY } = require("./list.js")
const read = require("./read.js")

test("read", () => {
  expect(read("nil")).toEqual(null)
  expect(read("()")).toEqual(EMPTY)
  expect(read("3")).toEqual(3)
  expect(read("hello")).toEqual("hello")

  expect(String(read("(1 2)"))).toEqual("(1 . (2 . ()))")
  expect(String(read("(1 2 . 3)"))).toEqual("(1 . (2 . 3))")
  expect(String(read("(1 (a) 3)"))).toEqual("(1 . ((a . ()) . (3 . ())))")

  expect(JSON.stringify(read("[1 2 a b]"))).toEqual(`[1,2,"a","b"]`)
})
