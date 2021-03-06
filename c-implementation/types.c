#include "mem.h"

// Int :: int -> Cell
cell Int(int i) {
  cell x = gcAlloc();
  x->type = INT;
  x->data.i = i;

  return x;
}

// Symbol :: char[] -> Cell
cell Symbol(char *s) {
  cell x = gcAlloc();
  x->type = SYMBOL;
  for (int i = 0; i < 15; i += 1) {
    x->data.s[i] = s[i];
  }
  x->data.s[15] = 0;

  return x;
} 

// Cons :: Cell -> Cell -> Cell
cell Cons(cell car, cell cdr) {
  cell xs = gcAlloc();
  xs->type = CONS;
  xs->data.c.car = car;
  xs->data.c.cdr = cdr;

  return xs;
}

cell Fn(cell fn, cell scope) {
  cell xs = gcAlloc();
  xs->type = FN;
  xs->data.c.car = fn;
  xs->data.c.cdr = scope;

  return xs;
}

cell Macro(cell fn, cell scope) {
  cell xs = gcAlloc();
  xs->type = MACRO;
  xs->data.c.car = fn;
  xs->data.c.cdr = scope;

  return xs;
}

// Core :: Func -> Cell
cell Core(core fn) {
  cell x = gcAlloc();
  x->type = CORE;
  x->data.fn = fn;

  return x;
}
