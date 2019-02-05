# LISP

Various lisp implementations.

## JavaScript

Lisp implementation in JavaScript that compiles to JavaScript and then evals the resulting code. Goal is maximum interoperability with JavaScript.

### Calling convention

```scheme
(f x y) ; f(x, y)
(lambda (x y . z) z) ; (x, y, ...z) => z
```

### ISeq

ISeq is a simple interface providing the first element in the sequence, and the rest. Is also includes `isEmpty` to test a sequence.

To build a sequence `seq` can be used, and this results in a lazy sequence.

```scheme
(define ones (seq 1 ones))

(first ones) ; 1
(first (rest ones)) ; 1
```

### List

List represents the traditional singly linked list in a lisp using cons cells. A list is also an Iterable, and implements ISeq.

```scheme
(define lst (cons 2 (cons 3 ())))
```

### TODO

- define proper interfaces (like ISeq) using Symbols on prototypes
- Throw error on unknown symbol
- Rename env in compile(exp,env) to bound? scope?
- Rename repl.js to makeModule?
- How to compile ahead of time without running costly expressions?
  - Need to run some expressions: they might be defining macros

### Reference

(these need to be checked in repl)

```scheme
(define x 10)

(export foobar)

(if x y z)

(import ./util.clj)

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
