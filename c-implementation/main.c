// TODO split into files: read, print, eval, etc.

#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include "mem.h"
#include "list.h"
#include "print.h"
#include "read.h"
#include "types.h"

cell GC_SCOPE;

bool eq(char *a, char *b) {
  return strcmp(a, b) == 0;
}

cell eval(cell, cell);

cell coreMul(cell scope, cell args, cell body) {
  int i = 1;
  while (args != Nil()) {
    i *= eval(scope, first(args))->data.i; // TODO check for Int
    args = rest(args);
  }

  return Int(i);
}

cell coreAdd(cell scope, cell args, cell body) {
  int i = 0;
  while (args != Nil()) {
    i += eval(scope, first(args))->data.i; // TODO check for Int
    args = rest(args);
  }

  return Int(i);
}

cell coreFn(cell scope, cell args, cell body) {
  return Core(8, args);
}

cell coreQuote(cell scope, cell args, cell body) {
  return first(args);
}

cell coreIf(cell scope, cell args, cell body) {
  cell value = eval(scope, first(args));
  if (value != Nil()) {
    return eval(scope, first(rest(args)));
  } else {
    return eval(scope, first(rest(rest(args))));
  }
}

cell coreFn2(cell scope, cell args, cell body) {
  cell names = first(body);
  cell newScope = scope;
  while (names != Nil()) {
    newScope = Cons(first(names), Cons(eval(scope, first(args)), newScope));
    names = rest(names);
    args = rest(args);
  }

  return eval(newScope, first(rest(body)));
}

cell coreEval(cell scope, cell args, cell body) {
  return eval(scope, eval(scope, first(args)));
}

cell coreDef(cell scope, cell args, cell body) {
  cell value = eval(scope, first(rest(args)));
  GC_SCOPE = Cons(first(args), Cons(value, GC_SCOPE));

  return value;
}

cell coreMacro(cell scope, cell args, cell body) {
  return Core(9, args);
}

cell coreMacro2(cell scope, cell args, cell body) {
  cell name = first(body);
  scope = Cons(name, Cons(args, scope));

  // return eval(scope, first(rest(body)));
  return eval(scope, eval(scope, first(rest(body))));
}

cell coreFirst(cell scope, cell args, cell body) {
  return first(eval(scope, first(args)));
}

cell coreRest(cell scope, cell args, cell body) {
  return rest(eval(scope, first(args)));
}

cell evalList(cell scope, cell xs) {
  if (xs == Nil()) return Nil();

  return Cons(eval(scope, first(xs)), evalList(scope, rest(xs)));
}

cell coreList(cell scope, cell args, cell body) {
  return evalList(scope, args);
}

cell coreCons(cell scope, cell args, cell body) {
  return Cons(eval(scope, first(args)), eval(scope, first(rest(args))));
}

cell coreEq(cell scope, cell args, cell body) {
  cell a = eval(scope, first(args));
  cell b = eval(scope, first(rest(args)));
  if (a->data.i == b->data.i) {
    return a; // hmm
  }

  return Nil();
}

// make multi args
cell corePrn(cell scope, cell args, cell body) {
  cell c = args;
  while (c != Nil()) {
    print(eval(scope, first(c)));
    printf(" ");
    c = rest(c);
  }

  printf("\n");

  return Nil();
}

cell coreSub(cell scope, cell args, cell body) {
  int i = eval(scope, first(args))->data.i;
  args = rest(args);
  while (args != Nil()) {
    i -= eval(scope, first(args))->data.i; // TODO check for Int
    args = rest(args);
  }

  return Int(i);
}

typedef cell (*_core)(cell, cell, cell);
_core core[] = {
  coreDef,
  coreMul,
  coreAdd,
  coreFn,
  coreQuote,
  coreIf,
  coreEval,
  coreMacro,
  coreFn2,
  coreMacro2,
  coreFirst,
  coreRest,
  coreList,
  coreCons,
  coreEq,
  corePrn,
  coreSub
};

// eval :: List a -> Cell -> Cell
cell eval(cell scope, cell x) {
  if (x == Nil()) return Nil();

  if (x->type == CONS) {
    cell op = eval(scope, x->data.c.first);
    if (op == Nil()) return Nil();

    cell args = rest(x);
    if (op->type == CORE) {
      return core[op->data.core.i](scope, args, op->data.core.body);
    }
  } else if (x->type == SYMBOL) {
    if (eq(x->data.s, "scope")) return scope;
    cell c = scope;
    while (c != Nil()) {
      if (eq(first(c)->data.s, x->data.s)) return first(rest(c));
      c = rest(rest(c));
    }

    printf("No such symbol. %s\n", x->data.s);
    return Nil();
  }
  
  return x;
}

// main :: () -> Int
int main() {
  GC_SCOPE = Nil();
  gcInit(10000);

  GC_SCOPE =
    Cons(Symbol("def"), Cons(Core(0, Nil()),
    Cons(Symbol("*"), Cons(Core(1, Nil()),
    Cons(Symbol("+"), Cons(Core(2, Nil()),
    Cons(Symbol("fn"), Cons(Core(3, Nil()),
    Cons(Symbol("quote"), Cons(Core(4, Nil()),
    Cons(Symbol("if"), Cons(Core(5, Nil()),
    Cons(Symbol("eval"), Cons(Core(6, Nil()),
    Cons(Symbol("macro"), Cons(Core(7, Nil()),
    Cons(Symbol("first"), Cons(Core(10, Nil()),
    Cons(Symbol("rest"), Cons(Core(11, Nil()),
    Cons(Symbol("list"), Cons(Core(12, Nil()),
    Cons(Symbol("cons"), Cons(Core(13, Nil()),
    Cons(Symbol("="), Cons(Core(14, Nil()),
    Cons(Symbol("prn"), Cons(Core(15, Nil()),
    Cons(Symbol("-"), Cons(Core(16, Nil()),
    Nil()))))))))))))))))))))))))))))));

  while (true) {
    gcFree();
    printf(" => ");
    cell code = read();
    if (code->type == SYMBOL && eq(code->data.s, ".exit")) break;

    code = eval(GC_SCOPE, code);
    print(code); printf("\n");
    gcRun(GC_SCOPE);
    printf("\n");
  }
}
