const { first, fold, isEmpty, map, ISeq, rest, Seq } = require("./ISeq.js")
const { EMPTY } = require("./list.js")

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

test("Seq", () => {
  const t = Seq(() => 2, () => Seq(() => 3, () => Seq(() => 5, () => EMPTY)))
  expect([...t]).toEqual([2, 3, 5])
})

test("seqArray", () => {
  expect([...ISeq([2, 3, 5])]).toEqual([2, 3, 5])
})

test("fold", () => {
  expect(fold((a, b) => a + b, 100, [2, 3, 5])).toEqual(110)
})

test("map", () => {
  expect([...map(x => x + 1, [2, 3, 5])]).toEqual([3, 4, 6])
  expect([...map(x => x, [])]).toEqual([])
})
