## LISP

An implementation of LISP written in C. The aim is to keep the core small and understandable, and provide a good interop (FFI) with C.

### Running

Use the TCC compile/run extention in VS Code and just press F10 in `main.c`, or something similar to:

```bash
tcc -run c-implementation/main.c
```

To exit the REPL, type `.exit`.

### JavaScript prototype

The prototype in `js-template` was used to try out some concepts and is not needed for the C implementation.
