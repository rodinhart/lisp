#include "mem.h"

cell first(cell x) {
  return x->data.c.first; // TODO check for Cons
}

cell rest(cell x) {
  return x->data.c.rest; // TODO check for Cons
}
