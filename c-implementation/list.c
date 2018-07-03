#include "mem.h"
#include "types.h"

cell car(cell x) {
  return x->data.c.car; // TODO check for Cons
}

cell cdr(cell x) {
  return x->data.c.cdr; // TODO check for Cons
}

cell assoc(cell m, cell k, cell v) {
  return Cons(k, Cons(v, m));
}

void push(cell m, cell k, cell v) {
  while (cdr(cdr(m)) != Nil()) {
    m = cdr(cdr(m));
  }

  m = cdr(m);
  m->data.c.cdr = Cons(k, Cons(v, Nil()));
}
