#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "mem.h"
#include "list.h"
#include "primitives.h"
#include "print.h"
#include "read.h"
#include "types.h"

cell GC_SCOPE;

bool eq(char *a, char *b) {
  return strcmp(a, b) == 0;
}

cell eval(cell scope, cell x) {
  while (true) {
    if (x == Nil()) return Nil();

    if (x->type == CONS) {
      cell op = eval(scope, x->data.c.car);
      if (op == Nil()) return Nil();

      cell args = cdr(x);
      if (op->type == CORE) {
        return op->data.fn(args, scope);
      } else if (op->type == FN) {
        cell body = op->data.c.car;
        cell names = car(body);
        cell newScope = op->data.c.cdr;
        while (names != Nil()) {
          newScope = assoc(newScope, car(names), eval(scope, car(args)));
          names = cdr(names);
          args = cdr(args);
        }

        scope = newScope;
        x = car(cdr(body));
      } else if (op->type == MACRO) {
        cell body = op->data.c.car;
        cell name = car(body);
        cell newScope = assoc(op->data.c.cdr, name, args);
        x = eval(newScope, car(cdr(body)));
        // return x;
      } else if (op->type == SYMBOL) {
        if (eq(op->data.s, "FN")) {
          return Fn(args, scope);
        } else if (eq(op->data.s, "IF")) {
          x = eval(scope, car(args));
          if (x != Nil()) {
            x = car(cdr(args));
          } else {
            x = car(cdr(cdr(args)));
          }
        } else if (eq(op->data.s, "QUOTE")) {
          return car(args);
        } else if (eq(op->data.s, "DEF")) {
          cell value = eval(scope, car(cdr(args)));
          push(GC_SCOPE, car(args), value);

          return value;
        } else if (eq(op->data.s, "MACRO")) {
          return Macro(args, scope);
        }
      }
    } else if (x->type == SYMBOL) {
      if (eq(x->data.s, "scope")) return scope;
      cell c = scope;
      while (c != Nil()) {
        if (eq(car(c)->data.s, x->data.s)) return car(cdr(c));
        c = cdr(cdr(c));
      }

      printf("No such symbol. %s\n", x->data.s);
      // exit(1);
      return Nil();
    } else {
      return x;
    }
  }
}

// main :: () -> Int
int main() {
  GC_SCOPE = Nil();
  gcInit(100000);

  GC_SCOPE = Nil();
  GC_SCOPE = assoc(GC_SCOPE, Symbol("fn"), Symbol("FN"));
  GC_SCOPE = assoc(GC_SCOPE, Symbol("if"), Symbol("IF"));
  GC_SCOPE = assoc(GC_SCOPE, Symbol("quote"), Symbol("QUOTE"));
  GC_SCOPE = assoc(GC_SCOPE, Symbol("def"), Symbol("DEF"));
  GC_SCOPE = assoc(GC_SCOPE, Symbol("macro"), Symbol("MACRO"));

  GC_SCOPE = primitives(GC_SCOPE);

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
