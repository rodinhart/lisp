# LISP

Lisp implementation in JavaScript that compiles to JavaScript and then evals the resulting code.

## TODO

- use Symbols for proper interface (see repl.it)
- implement list operations in terms of first/rest?
- how to include better function names, e.g. `atom?`, `+`

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
