# LISP

Lisp implementation in JavaScript that compiles to JavaScript and then evals the resulting code.

## TODO

- how to include better function names, e.g. `atom?`, `+`

- ISeq

  - first
  - rest

- Array : ISeq

  - []
  - [0]
  - .slice(1)

- Cons : ISeq
  - Cons.Empty
  - car
  - cdr

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
