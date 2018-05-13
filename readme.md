## LISP

An implementation of LISP written in C. The aim is to keep the core small and understandable, and provide a good interop (FFI) with C.

### Running

```bash
./run.bar
```

Or something similar.

To exit the REPL, type `.exit`.

### JavaScript prototype

The prototype in `js-template` was used to try out some concepts and is not needed for the C implementation.

### TODO

* Make fn body multi-arity
* read to handle EOF (for running files)
