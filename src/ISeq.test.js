const { first, isEmpty, ISeq, rest } = require("./ISeq.js")

test("ISeq", () => {
  let t = ISeq([2, 3, 5])
  expect(first(t)).toEqual(2)

  t = rest(t)
  expect(first(t)).toEqual(3)

  t = rest(t)
  expect(isEmpty(t)).toEqual(false)
  expect(first(t)).toEqual(5)

  t = rest(t)
  expect(isEmpty(t)).toEqual(true)
})
