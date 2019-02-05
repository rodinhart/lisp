const { EMPTY, car, cdr, Cons } = require("./list.js")

describe("Cons", () => {
  test("list", () => {
    expect(String(Cons(2, Cons(3, EMPTY)))).toEqual("(2 . (3 . ()))")
  })

  test("list without nil", () => {
    expect(String(Cons(2, Cons(3, 4)))).toEqual("(2 . (3 . 4))")
  })

  test("car", () => {
    expect(car(Cons(1, 2))).toEqual(1)
    expect(cdr(Cons(1, 2))).toEqual(2)
  })
})
