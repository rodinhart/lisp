const { IIterable } = require("./IIterable.js")

test("IIterable", () => {
  expect(IIterable({ a: 2, b: 3 })).toEqual([["a", 2], ["b", 3]])

  expect(IIterable([2, 3, 5])).toEqual([2, 3, 5])
})
