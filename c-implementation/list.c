#include "mem.h"
#include "types.h"

cell first(cell x) {
  return x->data.c.first; // TODO check for Cons
}

cell rest(cell x) {
  return x->data.c.rest; // TODO check for Cons
}

cell assoc(cell m, cell k, cell v) {
  return Cons(k, Cons(v, m));
}

void push(cell m, cell k, cell v) {
  while (rest(rest(m)) != Nil()) {
    m = rest(rest(m));
  }

  m = rest(m);
  m->data.c.rest = Cons(k, Cons(v, Nil()));
}
