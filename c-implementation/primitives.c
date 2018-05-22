#include "list.h"
#include "mem.h"
#include "main.h"
#include "print.h"
#include "types.h"

cell mul(cell args, cell scope) {
  int i = 1;
  while (args != Nil()) {
    i *= eval(scope, first(args))->data.i; // TODO check for Int
    args = rest(args);
  }

  return Int(i);
}

cell add(cell args, cell scope) {
  int i = 0;
  while (args != Nil()) {
    i += eval(scope, first(args))->data.i; // TODO check for Int
    args = rest(args);
  }

  return Int(i);
}

cell first2(cell args, cell scope) {
  return first(eval(scope, first(args)));
}

cell rest2(cell args, cell scope) {
  return rest(eval(scope, first(args)));
}

cell cons(cell args, cell scope) {
  return Cons(eval(scope, first(args)), eval(scope, first(rest(args))));
}

cell equal(cell args, cell scope) {
  cell a = eval(scope, first(args));
  cell b = eval(scope, first(rest(args)));
  if (a->data.i == b->data.i) {
    return a; // hmm,need True?
  }

  return Nil();
}

cell prn(cell args, cell scope) {
  cell c = args;
  while (c != Nil()) {
    print(eval(scope, first(c)));
    printf(" ");
    c = rest(c);
  }

  printf("\n");

  return Nil();
}

cell sub(cell args, cell scope) {
  int i = eval(scope, first(args))->data.i;
  args = rest(args);
  while (args != Nil()) {
    i -= eval(scope, first(args))->data.i; // TODO check for Int
    args = rest(args);
  }

  return Int(i);
}

cell eval2(cell args, cell scope) {
  return eval(scope, eval(scope, first(args)));
}

cell primitives(cell scope) {
  scope = assoc(scope, Symbol("*"), Core(mul));
  scope = assoc(scope, Symbol("+"), Core(add));
  scope = assoc(scope, Symbol("first"), Core(first2));
  scope = assoc(scope, Symbol("rest"), Core(rest2));
  scope = assoc(scope, Symbol("cons"), Core(cons));
  scope = assoc(scope, Symbol("="), Core(equal));
  scope = assoc(scope, Symbol("prn"), Core(prn));
  scope = assoc(scope, Symbol("-"), Core(sub));
  scope = assoc(scope, Symbol("eval"), Core(eval2));
}
