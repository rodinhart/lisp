#include "list.h"
#include "mem.h"
#include "main.h"
#include "print.h"
#include "types.h"

cell mul(cell args, cell scope) {
  int i = 1;
  while (args != Nil()) {
    i *= eval(scope, car(args))->data.i; // TODO check for Int
    args = cdr(args);
  }

  return Int(i);
}

cell add(cell args, cell scope) {
  int i = 0;
  while (args != Nil()) {
    i += eval(scope, car(args))->data.i; // TODO check for Int
    args = cdr(args);
  }

  return Int(i);
}

cell car2(cell args, cell scope) {
  return car(eval(scope, car(args)));
}

cell cdr2(cell args, cell scope) {
  return cdr(eval(scope, car(args)));
}

cell cons(cell args, cell scope) {
  return Cons(eval(scope, car(args)), eval(scope, car(cdr(args))));
}

cell equal(cell args, cell scope) {
  cell a = eval(scope, car(args));
  cell b = eval(scope, car(cdr(args)));
  if (a->data.i == b->data.i) {
    return a; // hmm,need True?
  }

  return Nil();
}

cell prn(cell args, cell scope) {
  cell c = args;
  while (c != Nil()) {
    print(eval(scope, car(c)));
    printf(" ");
    c = cdr(c);
  }

  printf("\n");

  return Nil();
}

cell sub(cell args, cell scope) {
  int i = eval(scope, car(args))->data.i;
  args = cdr(args);
  while (args != Nil()) {
    i -= eval(scope, car(args))->data.i; // TODO check for Int
    args = cdr(args);
  }

  return Int(i);
}

cell eval2(cell args, cell scope) {
  return eval(scope, eval(scope, car(args)));
}

cell primitives(cell scope) {
  scope = assoc(scope, Symbol("*"), Core(mul));
  scope = assoc(scope, Symbol("+"), Core(add));
  scope = assoc(scope, Symbol("car"), Core(car2));
  scope = assoc(scope, Symbol("cdr"), Core(cdr2));
  scope = assoc(scope, Symbol("cons"), Core(cons));
  scope = assoc(scope, Symbol("="), Core(equal));
  scope = assoc(scope, Symbol("prn"), Core(prn));
  scope = assoc(scope, Symbol("-"), Core(sub));
  scope = assoc(scope, Symbol("eval"), Core(eval2));
}
