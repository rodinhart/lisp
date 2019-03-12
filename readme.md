# LISP

Implementation in JavaScript that compiles to JavaScript and then evals the resulting code. Goal is maximum interoperability with JavaScript. Large parts are lifted from Scheme and Clojure.

## and

```clj
(and "" 0) ; ""
(and 0 "") ; 0
(and "a" 1) ; 1
(and 1 "a") ; "a"
```

## apply

```clj
(define nums [1 2 3 4])
(apply + nums) ; 10
```

## array

Arrays are supported as literals.

```clj
(define primes [2 3 5 7 11])

(define key "foo")
(define value 42)
(define tuple [key value]) ; ["foo" 42]
```

## boolean

`true` and `false` map directly to `true` and `false` in JavaScript.

## calling convention

```clj
;; Calling a procedure compiles directly to a JavaScript function call
(f x y) ; f(x, y)

;; Applying a sequence as (the rest of the) arguments is possible
(f x y . z) ; f(x, y, ...z)
(f x y . (list 2 3)) ; doesn't work, results in f(x, y, list, 2, 3)

;; Defining a procedure compiles directly to a JavaScript function
(lambda (x y . z) z) ; (x, y, ...z) => z
```

## concat

Conact two sequences.

```clj
(concat [1 2] `(3 4)) ; (1 2 3 4)
```

## cond

```clj
(cond
  (= x 10) "x is 10"
  (> x 10) "x greater than 10"
  true "x less than 10")
```

## define

Use `define` to create a reference to a value at the top level of a module.

```clj
(define SIZE 64)
```

Note that `define` can be reused to fix code when using the repl.

```clj
;; somewhere in a session
(define square (lambda (x) (+ x x)))

;; later in that session
(define square (lambda (x) (* x x)))
```

## defmacro

Shorthand for defining a macro.

```clj
(defmacro infix (a op b) (list op a b))
```

## defn

Shorthand for defining a function.

```clj
(defn square (x) (* x x))
```

## doto

```clj
(doto js/console (.log "Hello") (.log "World"))
```

## fn

Create a function, with destructuring.

```clj
((fn ((x y) (u v)) [(+ x u) (+ y v)]) [1 2] [3 4]) ; [4 6]
```

## if

Canonical way to make a choice.

```clj
(if (= x 10) "decimal" "other")
```

The predicate follows the truthy/falsy conventions of JavaScript, as the result from the compiler shows clearly.

```clj
(if x y z) ; (x ? y : z)
```

## import

Used to import another module.

```clj
(import mandelbrot ../fractals/mandelbrot.clj)

(mandelbrot/render -2 -2 4)
```

The module can by any (commonjs) module.

```clj
(import fs fs)

(fs/readFileSync "hello.txt")
```

## iterables

To enhance the interop with JavaScript, sequences implement the iterable interface (i.e. `Symbol.iterator`). So a lisp function returning a sequence can be used directly in JavaScript.

```clj
;; example.clj
(define getSeq (lambda () (seq 2 (seq 3 (seq 5 ())))))
```

```js
const example = require("./example.clj")

console.log([...example.getSeq()]) // [2, 3, 5]
```

## lambda

The core of any lisp is definitely lambda calculus.

```clj
((lambda (x y z) y) 1 2 3) ; 2
((lambda (x y . z) z) 1 2 3 4) ; [3 4]

;; the lambda body can be multiple expressions
(lambda add (a b)
  (log "adding...")
  (+ a b))
```

## let

```clj
(let [x (+ 1 2) y (+ 3 4)]
  (* x y)) ; 21
```

## list

List implements the traditional singly linked list in a lisp using `cons` cells.

```clj
(define lst (cons 2 (cons 3 ()))) ; (2 3)
(define lst2 (list 1 2 3 4)) ; (1 2 3 4)
```

Note that the `cdr` of a `cons` cell doesn't have to hold another `cons`, but the result won't be a sequence.

```clj
(define pair (cons 2 3))
```

## log

Log JavaScript value directly to the console.

```clj
(log {1 2 3 4}) ; {"1": 2, "3": 4}
```

## loop/recur

JavaScript is not so good with proper tail calls, so to achieve proper iterations loop/recur should be used.

```clj
(loop (x 6 s 0)
  (if (> x 0)
    (recur (- x 1) (+ s x))
    s)) ; 21
```

## macros

A macro is a function that takes a data structure, presumable representing code, and return transformed code. Macros are invoked before compilation to JavaScript in a phase called macro expansion.

```clj
(define infix (macro (x f y)
  (list f x y)))

(infix 3 + 4) ; 7
```

A syntax quote and unquote are provided to make reading and writing macros simpler.

```clj
(define x 10)
`(= ~x y) ; (= 10 y)
```

## map

```clj
(map (fn (x) (+ x 1)) [1 2 3]) ; (2 3 4)
```

## numbers

Just like in JavaScript, `number` is the only numeric type known.

```clj
(+ 24 18) ; 42
```

Note there is no numeric tower.

## null

`null` maps directly to `null` in JavaScript. Note that `nil` does not exist.

## object

Objects are supported as literals.

```clj
(define age 6)
(define cat { "name" "snuggles" "age" age })
```

Note that keys will always end up as strings.

```clj
{ 42 42 } ; { "42" 42 }
```

## or

```clj
(or 0 "") ; ""
(or "" 0) ; 0
(or 1 "a") ; 1
(or 0 "a") ; a
```

## println

Write a value to the console using the lisp printer.

```clj
(println {1 2 3 4}) ; {"1" 2 "3" 4}
```

## sequences

The `ISeq` interface comprises of three functions: `empty?`, `first` and `rest`. Data structures implementing are arrays, objects, lists and of course sequences.

`seq` can be used to build lazy sequences.

```clj
(define ones (seq 1 ones))

(first ones) ; 1
(first (rest ones)) ; 1
```

Note that an empty sequence is given by `()`.

```clj
(seq 3 ()) ; (3)
```

## strings

String such as `"hello world"` map directly to `string` in JavaScript.

## symbols

Lisp symbols are implemented using JavaScript `Symbol`. Should you need interop with lisp using symbols (unlikely) here is an example.

```js
const equations = require("./equations.clj")

// solve x * x = 4
console.log(
  equations.solve([
    Symbol.for("="),
    4,
    [Symbol.for("*"), Symbol.for("x"), Symbol.for("x")]
  ])
)
```

## take

```clj
(take 5 [1 2 3 4 5 6 7 8 9 10]) ; (1 2 3 4 5)
```

## undefined

`undefined` maps directly to `undefined` in JavaScript.

## whitespace

The usual whitespace

- spaces
- newlines
- carriage returns
- tabs

But also

- commas!

So both are valid.

```clj
(define x [1 2 3])
(define y [1, 2, 3])
```

## zip

```clj
(zip + [1 2 4] [8 16]) ; (9 18)
```

## TODO

- define proper interfaces (like ISeq) using Symbols on prototypes
- Throw error on unknown symbol
- use [] anywhere?
- documentation
- ({} "hello") and ("hello" {})? IFn?
- macroexpand - (quote (let [x 10] x))
- ISeq for objects
- test seqArray.iterator
- arity?
