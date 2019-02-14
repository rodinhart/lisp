# LISP

Various lisp implementations.

## JavaScript

Implementation in JavaScript that compiles to JavaScript and then evals the resulting code. Goal is maximum interoperability with JavaScript.

### Calling convention

```scheme
(f x y) ; f(x, y)
(lambda (x y . z) z) ; (x, y, ...z) => z
(define list (lambda x x)); (...x) => x Note that this returns an Iseq
```

### seq

To build an IIterable `seq` can be used, and this results in a lazy sequence.

```scheme
(define ones (seq 1 ones))

(first ones) ; 1
(first (rest ones)) ; 1
```

### List

List represents the traditional singly linked list in a lisp using cons cells.

```scheme
(define lst (cons 2 (cons 3 ())))
(define pair (cons 2 3))
```

### TODO

- back to .clj
- optional second clause in (if) resulting in undefined
- body in (loop)
- (let)
- have compiler use ISeq, not List? So macro can return ISeq?
- have repl use lisp.js
- add strings with spaces
- unit testing of core.scm
- fold and map if list is not list, e.g. (2 3 . 4)
- test calling conventions
  - call lisp function: f(1, 2, 3)
  - call js function (apply f lst)
- support arrays and maps
- define proper interfaces (like ISeq) using Symbols on prototypes
- Throw error on unknown symbol
- Rename env in compile(exp,env) to bound? scope?
- How to compile ahead of time without running costly expressions?
  - Need to run some expressions: they might be defining macros
- add arrays []
- add maps { "a" 1 "b" 2}
- How to deal with undefined
- Check missing namespaced symbols: js.Foobar/baz
- does define rollup?

### Reference

```scheme
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
