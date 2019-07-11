const fs = require("fs")
const lisp = require("./lisp.js")
const prn = require("./print.js")
const read = require("./read.js")

console.log(
  read("(" + String(fs.readFileSync(require.resolve("./coretest.clj"))) + ")")
)

// const { concat, destruct, fn, flatten, let: lett, list, take, zip } = lisp(
//   {},
//   String(fs.readFileSync(require.resolve("./core.clj")))
// )

// test("concat", () => {
//   expect(prn(concat(list(1, 2), { a: 3 }, [4, 5]))).toEqual(`(1 2 ["a" 3] 4 5)`)
// })

// test("destruct", () => {
//   expect(prn(destruct(list(list(Symbol.for("x"))), Symbol.for("t")))).toEqual(
//     "((first (first t)))"
//   )
// })

// test("flatten", () => {
//   expect(prn(flatten(list(list(Symbol.for("x"), Symbol.for("y")))))).toEqual(
//     "(x y)"
//   )
// })

// test("fn", () => {
//   expect(prn(fn(read("((x y) s)"), read("(+ x y)"), read("s")))).toEqual(
//     "(lambda t ((lambda (x y s) (+ x y) s) (first (first t)) (first (rest (first t))) (first (rest t))))"
//   )
// })

// test("let", () => {
//   expect(prn(lett([Symbol.for("x"), 2, Symbol.for("y"), 3], 5, 7))).toEqual(
//     "((fn (x y) 5 7) 2 3)"
//   )
// })

// test("list", () => {
//   expect(String(list(2, 3, 5))).toEqual("(2 . (3 . (5 . ())))")
// })

// test("take", () => {
//   expect(prn(take(3, [1, 2, 3, 4, 5]))).toEqual("(1 2 3)")
// })

// test("zip", () => {
//   expect(prn(zip((a, b) => a + b, [1, 2, 4], [8, 16, 32]))).toEqual("(9 18 36)")
// })
