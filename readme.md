# LISP

Lisp implementation in JavaScript that compiles to JavaScript and then evals the resulting code.

## TODO

- Throw error on unknown symbol
- Rename repl.js to makeModule?
- How to compile ahead of time without running costly expressions?
  - Need to run some expressions: they might be defining macros

## C implementation

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
