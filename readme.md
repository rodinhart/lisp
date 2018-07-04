## LISP

An implementation of LISP written in C. The aim is to keep the core small and understandable, and provide a good interop (FFI) with C.

### Running

```bash
./run.bat
```

Or something similar.

To exit the REPL, type `.exit`.

### TODO

- Implement OR using maco
- Fix macros!
- GC while evaluation, requires assembly with stack
- Make Error type, and more checking
- Make fn body multi-arity
- read to handle EOF (for running files)
- destructuring
- tests
