## LISP

An implementation of LISP written in C. The aim is to keep the core small and understandable, and provide a good interop (FFI) with C.

### Running

```bash
./run.bat
```

Or something similar.

To exit the REPL, type `.exit`.

### TODO

* def to return nil
* Allow comments
* Make Error type, and more checking
* Make fn body multi-arity
* read to handle EOF (for running files)
* destructuring
* tests
