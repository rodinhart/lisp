## LISP

Lisp implementation in JavaScript that compiles to JavaScript and then evals the resulting code.

### TODO

- how to include better function names, e.g. `atom?`, `+`

- follow js calling conventions?

```scheme
((lambda (x y . z) ()) 1 2 3 4)
```

```js
;((x, y, ...z) => null)(1, 2, 3, 4)
```

```scheme
(apply f sq)
```

```js
f.apply(null, [...sq])
```

`(list 1 2 3) -> (1 . (2 . (3 . nil)))`

`[1 2 3] -> [1 2 3]`

`(array 1 2 3) -> [1 2 3]`


- Clean out this readme and c implementation?

### C implementation

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
