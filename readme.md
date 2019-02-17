# LISP

Various lisp implementations.

## JavaScript

Implementation in JavaScript that compiles to JavaScript and then evals the resulting code. Goal is maximum interoperability with JavaScript.

### Booleans

`true` and `false` map directly to `true` and `false` in JavaScript.

### Calling convention

```clj
;; Calling a procedure compiles directly to a JavaScript function call
(f x y) ; f(x, y)

;; Applying a sequence as (the rest of the) arguments is possible
(f x y . z) ; f(x, y, ...z)
(f x y . (list 2 3)) ; might not be what you want, results in f(x, y, list, 2, 3)

;; Defining a procedure compiles directly to a JavaScript function
(lambda (x y . z) z) ; (x, y, ...z) => z
```

### Define

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

### If

Canonical way to make a choice.

```clj
(if (= x 10) "decimal" "other")
```

The predicate follows the truthy/falsy conventions of JavaScript, as the result from the compiler shows clearly.

```clj
(if x y z) ; (x ? y : z)
```

### Import

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

### ISeq

The `ISeq` interface comprises of three functions: `empty?`, `first` and `rest`. Data structures implementing are arrays, objects, lists and of course sequences.

### Number

Just like in JavaScript, `number` is the only numeric type known. Note there is no numeric tower.

### seq

`seq` can be used to build lazy sequences.

```clj
(define ones (seq 1 ones))

(first ones) ; 1
(first (rest ones)) ; 1
```

### String

String such as `"hello world"` map directly to `string` in JavaScript.

### Lambda

The core of any lisp is definitely lambda calculus.

```clj
((lambda (x y z) y) 1 2 3) ; 2
((lambda (x y . z) z) 1 2 3 4) ; (3 4)

;; the lambda body can be multiple expressions
(lambda add (a b)
  (log "adding...")
  (+ a b))
```

### List

List represents the traditional singly linked list in a lisp using cons cells.

```clj
(define lst (cons 2 (cons 3 ())))
(define pair (cons 2 3))
```

### Loop/Recur

JavaScript is not so good with proper tail calls, so to achieve proper iterations loop/recur should be used.

```clj
(loop (x 6 s 0)
  (if (> x 0)
    (recur (- x 1) (+ s x))
    s)) ; 21
```

### Macros

A macro is a function that takes a data structure, presumable representing code, and return transformed code. Macros are invoked before compilation to JavaScript in a phase called macro expansion.

```clj
(define infix (macro (x f y)
  (list f x y)))
(infix 3 + 4) ; 7
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
- handle backquote in lisp loader

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
