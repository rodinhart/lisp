// TODO split into files: read, print, eval, etc.

#include "ctype.h"
#include "stdbool.h"
#include "stdio.h"
#include "stdlib.h"

enum { INT, SYMBOL, CONS, CORE };

typedef struct _cell {
  union {
    int i;
    char s[8];
    struct {
      struct _cell *first;
      struct _cell *rest;
    } c;
  } data;
  unsigned int type : 2;
  unsigned int marked : 1;
} *cell;
cell Nil = NULL;

int GC_N;
cell GC_MEM;
cell GC_FREE;
cell GC_SCOPE;

// gcMark :: Cell -> ()
void gcMark(cell x) {
  if (x == Nil) return;
  if (x->type == CONS) {
    while (x != Nil) {
      x->marked = true;
      gcMark(x->data.c.first);
      x = x->data.c.rest;
    }
  } else {
    x->marked = true;
  }
}

// gcRun :: () -> ()
void gcRun() {
  gcMark(GC_SCOPE);

  GC_FREE = Nil;
  for (int i = 0; i < GC_N; i += 1) {
    cell x = GC_MEM + i;
    if (x->marked) {
      x->marked = 0;
    } else {
      x->type = CONS;
      x->data.c.rest = GC_FREE;
      GC_FREE = x;
    }
  }
}

// gcInit :: Int -> ()
void gcInit(int N) {
  GC_N = N;
  GC_MEM = (cell)malloc(GC_N * sizeof(struct _cell));
  for (int i = 0; i < GC_N; i += 1) {
    cell x = GC_MEM + i;
    x->marked = 0;
  }

  GC_SCOPE = Nil;
  gcRun();
}

// gcAlloc :: () -> Cell
cell gcAlloc() {
  // if (GC_FREE == Nil) gcRun();
  if (GC_FREE == Nil) {
    printf("Out of memory.\n");
    exit(1);
  }

  cell xs = GC_FREE;
  GC_FREE = xs->data.c.rest;

  return xs;
}

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
  for (int i = 0; i < 7; i += 1) {
    x->data.s[i] = s[i];
  }
  x->data.s[7] = 0;

  return x;
} 

// Cons :: Cell -> Cell -> Cell
cell Cons(cell first, cell rest) {
  cell xs = gcAlloc();
  xs->type = CONS;
  xs->data.c.first = first;
  xs->data.c.rest = rest;

  return xs;
}

// Core :: int -> Cell
cell Core(int i) {
  cell x = gcAlloc();
  x->type = CORE;
  x->data.i = i;

  return x;
}

// count :: List a -> Int
int count(cell xs) {
  int count = 0;
  while (xs != Nil) {
    count += 1;
    xs = xs->data.c.rest;
  }

  return count;
}

// gcFree :: () -> ()
void gcFree() {
  printf("free: %i / %i\n", count(GC_FREE), GC_N);
}

// print :: a -> ()
void print(cell x) {
  if (x == Nil) {
    printf("()");
    return;
  }

  if (x->type == CONS) {
    printf("(");
    char space = 0;
    while (x != Nil) {
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
    printf("FN%i", x->data.i);
  }
}

int C;
cell readCell();

void readSpace() {
  while ((C = getc(stdin)) != EOF && isspace(C));
}

cell readInt() {
  char buf[32];
  buf[0] = C;
  int i = 1;
  while ((C = getc(stdin)) != EOF && isdigit(C)) buf[i++] = C; // TODO check buffer overflow
  buf[i] = 0;

  return Int(atoi(buf));
}

cell readSymbol() {
  char buf[32];
  buf[0] = C;
  int i = 1;
  while ((C = getc(stdin)) != EOF && !isspace(C) && C != ')') buf[i++] = C; // TODO check buffer overflow
  buf[i] = 0;

  return Symbol(buf);
}

cell readCons() {
  cell xs = Nil, c = Nil, first;

  do {
    readSpace();
    if (C == EOF) {
      printf("Missing )\n");
      return Nil;
    }

    if (C == ')') {
      C = getc(stdin);
      return xs;
    }

    first = readCell();
    if (!c) {
      xs = c = Cons(first, Nil);
    } else {
      c->data.c.rest = Cons(first, Nil);
      c = c->data.c.rest;
    }

    if (C == ')') {
      C = getc(stdin);
      return xs;
    }
  } while (true);
}

cell readCell() {
  if (isdigit(C)) {
    return readInt();
  } else if (C == '(') {
    return readCons();
  } else if (C != ')') {
    return readSymbol();
  }
}

// read :: () -> a
cell read() {
  readSpace();
  if (C == EOF) return Nil;
  return readCell();
}

cell first(cell x) {
  return x->data.c.first; // TODO check for Cons
}

cell rest(cell x) {
  return x->data.c.rest; // TODO check for Cons
}

bool eq(char *a, char *b) {
  return strcmp(a, b) == 0;
}

cell eval(cell, cell);

cell def(cell scope, cell expr, cell args) {
  cell value = eval(scope, first(rest(args)));
  GC_SCOPE = Cons(first(args), Cons(value, GC_SCOPE));

  return value;
}

cell mul(cell scope, cell expr, cell args) {
  int i = 1;
  while (args != Nil) {
    i *= eval(scope, first(args))->data.i; // TODO check for Int
    args = rest(args);
  }

  return Int(i);
}

cell add(cell scope, cell expr, cell args) {
  int i = 0;
  while (args != Nil) {
    i += eval(scope, first(args))->data.i; // TODO check for Int
    args = rest(args);
  }

  return Int(i);
}

cell fn(cell scope, cell expr, cell args) {
  return expr;
}

typedef cell (*_core)(cell, cell, cell);
_core core[] = {
  def,
  mul,
  add,
  fn
};

// eval :: List a -> Cell -> Cell
cell eval(cell scope, cell x) {
  if (x == Nil) return Nil;

  if (x->type == CONS) {
    cell op = eval(scope, x->data.c.first);
    if (op == Nil) return Nil;

    cell args = rest(x);
    if (op->type == CORE) {
      return core[op->data.i](scope, x, args);
    } else { // TODO check op is lambda
      cell names = first(rest(op));
      while (names != Nil) {
        scope = Cons(first(names), Cons(eval(scope, first(args)), scope));
        names = rest(names);
        args = rest(args);
      }

      return eval(scope, first(rest(rest(op))));
    }
  } else if (x->type == SYMBOL) {
    if (eq(x->data.s, "scope")) return scope;
    cell c = scope;
    while (c != Nil) {
      if (eq(first(c)->data.s, x->data.s)) return first(rest(c));
      c = rest(rest(c));
    }

    printf("No such symbol. %s\n", x->data.s);
    return Nil;
  }
  
  return x;
}

// main :: () -> Int
int main() {
  gcInit(200);

  GC_SCOPE =
    Cons(Symbol("def"), Cons(Core(0),
    Cons(Symbol("*"), Cons(Core(1),
    Cons(Symbol("+"), Cons(Core(2),
    Cons(Symbol("fn"), Cons(Core(3),
    Nil))))))));

  while (C != EOF) {
    printf(" => ");
    cell code = read();
    code = eval(GC_SCOPE, code);
    print(code); printf("\n");
    gcRun();
    gcFree();
    printf("\n");
  }
}
