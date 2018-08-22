// repeated macroexpand
// make macroexpand iterative?
// refactor function and macro application
// make prn pretty print multiline
// test iteration
// make macro quoting default, with special char for eval
// scope with parent for easier printing?

const assert = b => {
  if (b !== true) throw new Error("Assertion failed. " + b)
}

const concat = (xs, ys) => (xs !== null ? [xs[0], concat(xs[1], ys)] : ys)
assert(
  JSON.stringify(concat([1, [2, null]], [3, [4, null]])) ===
    "[1,[2,[3,[4,null]]]]"
)

const fold = (f, init) => xs =>
  xs !== null ? fold(f, f(init, xs[0]))(xs[1]) : init
const identity = x => x
const length = fold((r, x) => r + 1, 0)
const map = f => xs => (xs !== null ? [f(xs[0]), map(f)(xs[1])] : null)
const thread = (x, ...fs) => fs.reduce((x, f) => f(x), x)

const read = s => {
  const _ = x => {
    if (!x.length) return null
    const f = x.shift()
    if (f === "(") {
      const r = [null, null]
      let c = r
      while (x.length && x[0] !== "." && x[0] !== ")") {
        c[1] = [_(x), null]
        c = c[1]
      }

      if (x[0] === ".") {
        x.shift()
        c[1] = _(x)
      }

      if (x.shift() !== ")") throw new Error("Missing )")

      return r[1]
    }

    return String(Number(f)) === f ? Number(f) : f
  }

  return _(
    s
      .replace(/(;.*\n)/g, "\n")
      .replace(/(\(|\))/g, " $1 ")
      .split(/\s/)
      .filter(identity)
  )
}

assert(read("3") === 3, 3)
assert(read("hello") === "hello")
assert(JSON.stringify(read("(1 (a) 3)")) === `[1,[["a",null],[3,null]]]`)
assert(read("()") === null)
assert(JSON.stringify(read("(1 2 . 3)")) === "[1,[2,3]]")
assert(JSON.stringify(read("(1 . (2 . (3 . ())))")) === "[1,[2,[3,null]]]")

const prn = x => {
  if (x instanceof Array) {
    const r = []
    while (x !== null) {
      if (x instanceof Array) {
        r.push(prn(x[0]))
        x = x[1]
      } else {
        r.push(".")
        r.push(prn(x))
        x = null
      }
    }
    return `(${r.join(" ")})`
  } else if (x && typeof x === "object") {
    return `{${Object.entries(x)
      .filter(
        ([key, val]) =>
          !val || (typeof val !== "object" && typeof val !== "function")
      )
      .map(([key, val]) => `${key}: ${val}`)
      .join(", ")}}`
  }

  return x === null ? "()" : String(x)
}

assert(prn(3) === "3")
assert(prn("a") === "a")
assert(prn([1, [2, [["a", null], null]]]) === "(1 2 (a))")
assert(prn(null) === "()")
assert(prn([1, 2]) === "(1 . 2)")
assert(prn([1, [[2, 3], 4]]) === "(1 (2 . 3) . 4)")

const evalǃ = _scope => x => {
  let scope = _scope
  while (true) {
    if (x instanceof Array) {
      // combination
      const op = evalǃ(scope)(x[0])

      switch (op) {
        case "LAMBDA":
          return concat(x, [scope, null])

        case "IF":
          const cond = evalǃ(scope)(x[1][0])
          if (cond !== null) {
            x = x[1][1][0]
          } else {
            x = x[1][1][1][0]
          }
          break

        case "DEFINE":
          scope[x[1][0]] = evalǃ(scope)(x[1][1][0])
          return x[1][0]

        case "QUOTE":
          return x[1][0]

        case "MACRO":
          return concat(x, [scope, null])

        default:
          if (op instanceof Array && op[0] === "lambda") {
            // (lambda (x y) (+ x y) scope)
            let newScope = { ...op[1][1][1][0] }
            let names = op[1][0]
            x = x[1]
            while (names !== null) {
              if (names instanceof Array) {
                newScope[names[0]] = evalǃ(scope)(x[0])
                names = names[1]
                x = x[1]
              } else {
                newScope[names] = map(evalǃ(scope))(x)
                names = null
              }
            }

            scope = newScope
            x = op[1][1][0]
          } else if (typeof op === "function") {
            return op(scope)(map(evalǃ(scope))(x[1]))
          } else {
            throw new Error(
              "Unknown operation: " +
                prn(op) +
                "\nin " +
                prn(x) +
                "\nwith " +
                prn(scope)
            )
          }
          break
      }
    } else {
      if (typeof x === "string") {
        if (scope[x] === undefined) throw new Error("No such symbol: " + x)
        return scope[x]
      }

      return x
    }
  }
}

const macroexpand = scope => x => {
  if (!(x instanceof Array)) return x

  const map = f => xs => {
    if (xs === null) return null

    const y = f(xs[0])
    const ys = map(f)(xs[1])
    return y === xs[0] && ys === xs[1] ? xs : [y, ys]
  }

  let xs = x
  let ys = map(macroexpand(scope))(xs)
  while (ys !== xs) {
    xs = ys
    ys = map(macroexpand(scope))(xs)
  }

  const op = scope[xs[0]]
  if (!(op instanceof Array && op[0] === "macro")) return xs

  // op = (macro (x) x scope)
  // xs = (defn foo (bar) 42)
  let newScope = { ...op[1][1][1][0] }
  let names = op[1][0]
  xs = xs[1]
  while (names !== null) {
    if (names instanceof Array) {
      newScope[names[0]] = xs[0]
      names = names[1]
      xs = xs[1]
    } else {
      newScope[names] = xs
      names = null
      xs = null
    }
  }

  return macroexpand(scope)(evalǃ(newScope)(op[1][1][0]))
}

const core = {
  lambda: "LAMBDA",
  if: "IF",
  define: "DEFINE",
  quote: "QUOTE",
  macro: "MACRO",

  "+": scope => fold((r, x) => r + x, 0),
  "-": scope => xs => xs[0] - xs[1][0],
  "*": scope => fold((r, x) => r * x, 1),
  ">": scope => xs => (xs[0] > xs[1][0] ? 1 : null),
  "atom?": scope => x => (x[0] instanceof Array ? null : 1),
  car: scope => xs => xs[0][0],
  cdr: scope => xs => xs[0][1],
  cons: scope => xs => [xs[0], xs[1][0]],
  macroexpand: scope => xs => macroexpand(scope)(xs[0])
}

const mac = evalǃ(core)(read(`(macro (x) (cons x (cons x ())))`))
assert(
  thread(
    `(m 3)`,
    read,
    macroexpand({
      ...core,
      m: mac
    }),
    prn
  ) === "(3 3)"
)

assert(
  thread(
    `(m (m 3))`,
    read,
    macroexpand({
      ...core,
      m: mac
    }),
    prn
  ) === "((3 3) (3 3))"
)

assert(
  thread(
    `(concat (m 3))`,
    read,
    macroexpand({
      ...core,
      m: mac
    }),
    prn
  ) === "(concat (3 3))"
)

const mec = evalǃ(core)(read(`(macro x (cons (quote m) x))`))
assert(
  thread(
    `(mec 4)`,
    read,
    macroexpand({
      ...core,
      m: mac,
      mec
    }),
    prn
  ) === "(4 4)"
)

assert(evalǃ({})(3) === 3)
assert(evalǃ({ a: 7 })("a") === 7)
assert(evalǃ(core)(["+", [2, [3, null]]]) === 5)

const tst = s => evalǃ({ ...core })(read(s))
assert(tst("(+ 5 7)") === 12)

assert(tst("(lambda (x) (+ x x))")[0] === "lambda")
assert(length(tst("(lambda (x) (+ x x))")) === 4)
assert(tst("((lambda (x) (+ x x)) 3)") === 6)
assert(tst("((lambda (x y) y) 3 5)") === 5)
assert(JSON.stringify(tst("((lambda x x) 2 3 5)")) === "[2,[3,[5,null]]]")
assert(tst("((lambda (x y . z) x) 1 2 3 4 5)") === 1)
assert(tst("((lambda (x y . z) y) 1 2 3 4 5)") === 2)
assert(
  JSON.stringify(tst("((lambda (x y . z) z) 1 2 3 4 5)")) === "[3,[4,[5,null]]]"
)

assert(tst("(if 0 1 2)") === 1)
assert(tst("(if () 1 2)") === 2)

assert(tst("(define x 10)") === "x")
const t = { ...core }
assert(evalǃ(t)(read("(define x 11)")) === "x")
assert(t.x === 11)

assert(tst("(quote a)") === "a")

thread(
  `(
    (define list (lambda x x))

    (define concat (lambda (xs ys)
      (if xs
        (cons
          (car xs)
          (concat (cdr xs) ys)
        )
        ys
      )
    ))

    (define destruct (lambda (pat arg)
      (if pat
        (if (atom? pat)
          (cons arg ())
          (concat
            (destruct (car pat) (list (quote car) arg))
            (destruct (cdr pat) (list (quote cdr) arg))
          )
        )
        ()
      )
    ))

    (define flatten (lambda (pat)
      (if pat
        (if (atom? pat)
          (cons pat ())
          (concat
            (flatten (car pat))
            (flatten (cdr pat))
          )
        )
        ()
      )
    ))

    (define fn (macro (params body)
      (list
        (quote lambda)
        (quote t)
        (cons
          (list
            (quote lambda)
            (flatten params)
            body
          )
          (destruct params (quote t))
        )
      )
    ))

    (define defn (macro x
      (list
        (quote define)
        (car x)
        (list
          (quote fn)
          (car (cdr x))
          (car (cdr (cdr x)))
        )
      )
    ))

    (defn vec-add ((x1 y1) (x2 y2)) (list (+ x1 x2) (+ y1 y2)))
    (vec-add (list 2 3) (list 4 5))

    ; lazy seq
    (define lazy-seq (macro (x y) (list
      (quote cons)
      x
      (list
        (quote lambda)
        ()
        y
      )
    )))

    (defn first (x) (car x))
    (defn rest (z) ((cdr z)))
    (defn reify (x) (if x
      (cons (first x) (reify (rest x)))
      ()
    ))
    (defn take (n x)
      (if (> n 0)
        (lazy-seq (first x) (take (- n 1) (rest x)))
        ()
      )
    )
    
    (define ns (lambda (n)
      (lazy-seq n (ns (+ n 1)))
    ))

    (reify (take 10 (ns 1)))

  )`,
  read,
  fold((r, x) => {
    // console.log("\nx", prn(x))
    const ex = macroexpand(core)(x)
    // console.log("y", prn(ex))

    return evalǃ(core)(ex)
  }, null),
  // fold((r, x) => evalǃ(core)(macroexpand(core)(x)), null),
  prn,
  console.log
)
