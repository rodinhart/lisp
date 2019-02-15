# LISP

Various lisp implementations.

## JavaScript

Implementation in JavaScript that compiles to JavaScript and then evals the resulting code. Goal is maximum interoperability with JavaScript.

### Booleans

`true` and `false` map directly to `true` and `false` in JavaScript.

### Calling convention

```scheme
(f x y) ; f(x, y)
(lambda (x y . z) z) ; (x, y, ...z) => z
(define list (lambda x x)); (...x) => x Note that this returns an Iseq
```

### Number

Just like JavaScript, `number` is the only numeric type known. Note there is no numeric tower.

### seq

To build an IIterable `seq` can be used, and this results in a lazy sequence.

```clj
(define ones (seq 1 ones))

(first ones) ; 1
(first (rest ones)) ; 1
```

### String

`string` maps directly to `string` in JavaScript.

### List

List represents the traditional singly linked list in a lisp using cons cells.

```clj
(define lst (cons 2 (cons 3 ())))
(define pair (cons 2 3))
```

### Null

`null` maps directly to `null` in JavaScript. Note that `nil` does not exist.

### Undefined

`undefined` maps directly to `undefined` in JavaScript.

### TODO

- (let)
- add strings with spaces
- define proper interfaces (like ISeq) using Symbols on prototypes
- How to compile ahead of time without running costly expressions?
  - Need to run some expressions: they might be defining macros
- Throw error on unknown symbol
- backquote
- use [] anywhere?
- documentation
- make (.log js/console . xs) work
- ({} "hello") and ("hello" {})? IFn?
- macroexpand
- ISeq for objects

### Reference

```clj
(define x 10)

(export foobar)

(if x y z)

(import util ./util.clj)

(lambda (x y) (+ x y))

(loop (x 10 s 0)
  (if (= x 1)
    s
    (recur (- x 1) (+ s x))))

(macro x x)

(prn js.Math/PI)
```

## ARMv2

To see what garbage collection and stack disipline look like.

## C (defunct)

An implementation of LISP written in C. The aim is to keep the core small and understandable, and provide a good interop (FFI) with C.

```bash
./run.bat
```

Or something similar.

To exit the REPL, type `.exit`.

#### TODO

- Implement OR using maco
- Fix macros!
- GC while evaluation, requires assembly with stack
- Make Error type, and more checking
- Make fn body multi-arity
- read to handle EOF (for running files)
- destructuring
- tests
