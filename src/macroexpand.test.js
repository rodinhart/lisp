const { EMPTY } = require("./list.js")
const macroexpand = require("./macroexpand.js")
const prn = require("./print.js")
const read = require("./read.js")

test("macroexpand", () => {
  expect(macroexpand(null, {})).toEqual(null)
  expect(macroexpand(EMPTY, {})).toBe(EMPTY)
  expect(macroexpand(42, {})).toEqual(42)
  expect(macroexpand("y", {})).toEqual("y")

  expect(prn(macroexpand(read(`(1 2 3)`), {}))).toEqual("(1 2 3)")
  expect(prn(macroexpand(read(`(1 2 . 3)`), {}))).toEqual("(1 2 . 3)")

  const env = {}
  env.first__ = Object.assign((x, y) => x, { macro: true })
  expect(prn(macroexpand(read(`(first__ (add 1 2) (add 3 4))`), env))).toEqual(
    "(add 1 2)"
  )
})
