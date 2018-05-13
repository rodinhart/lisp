#include "mem.h"

// print :: a -> ()
void print(cell x) {
  if (x == Nil()) {
    printf("()");
    return;
  }

  if (x->type == CONS) {
    printf("(");
    char space = 0;
    while (x != Nil()) {
      if (space) printf(" ");
      print(x->data.c.first);
      space = 1;
      x = x->data.c.rest;
    }
    printf(")");
  } else if (x->type == INT) {
    printf("%i", x->data.i);
  } else if (x->type == SYMBOL) {
    printf("%s", x->data.s);
  } else if (x->type == CORE) {
    printf("FN%i", x->data.core.i);
    // if (x->data.core.body != Nil()) {
    //   printf(" ");
    //   print(x->data.core.body);
    // }
  }
}
