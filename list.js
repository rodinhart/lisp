const { assert } = require("./lang.js")

const concat = (xs, ys) => (xs !== null ? [xs[0], concat(xs[1], ys)] : ys)
assert(
  JSON.stringify(concat([1, [2, null]], [3, [4, null]])) ===
    "[1,[2,[3,[4,null]]]]"
)

const fold = (f, init) => xs =>
  xs !== null ? fold(f, f(init, xs[0]))(xs[1]) : init

const length = fold((r, x) => r + 1, 0)

const map = f => xs => (xs !== null ? [f(xs[0]), map(f)(xs[1])] : null)

const toArray = xs =>
  fold((r, x) => {
    r.push(x)

    return r
  }, [])(xs)

module.exports = {
  concat,
  fold,
  length,
  map,
  toArray
}
