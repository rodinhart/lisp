// TODO split into files: read, print, eval, etc.

#include "ctype.h"
#include "stdbool.h"
#include "stdio.h"
#include "stdlib.h"

enum { INT, SYMBOL, CONS, CORE };

typedef struct _cell {
  union {
    int i;
    struct {
      int i;
      struct _cell *body;
    } core;
    char s[16];
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
  } else if (x->type == CORE) {
    x->marked = true;
    gcMark(x->data.core.body);
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
  printf("Cell size: %i bytes\n", sizeof(struct _cell));
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
  for (int i = 0; i < 15; i += 1) {
    x->data.s[i] = s[i];
  }
  x->data.s[15] = 0;

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

// Core :: int -> Cell -> Cell
cell Core(int i, cell body) {
  cell x = gcAlloc();
  x->type = CORE;
  x->data.core.i = i;
  x->data.core.body = body;

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
    printf("FN%i", x->data.core.i);
    // if (x->data.core.body != Nil) {
    //   printf(" ");
    //   print(x->data.core.body);
    // }
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

cell coreMul(cell scope, cell args, cell body) {
  int i = 1;
  while (args != Nil) {
    i *= eval(scope, first(args))->data.i; // TODO check for Int
    args = rest(args);
  }

  return Int(i);
}

cell coreAdd(cell scope, cell args, cell body) {
  int i = 0;
  while (args != Nil) {
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
  if (value != Nil) {
    return eval(scope, first(rest(args)));
  } else {
    return eval(scope, first(rest(rest(args))));
  }
}

cell coreFn2(cell scope, cell args, cell body) {
  cell names = first(body);
  cell newScope = scope;
  while (names != Nil) {
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
  if (xs == Nil) return Nil;

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

  return Nil;
}

// make multi args
cell corePrn(cell scope, cell args, cell body) {
  cell c = args;
  while (c != Nil) {
    print(eval(scope, first(c)));
    printf(" ");
    c = rest(c);
  }

  printf("\n");

  return Nil;
}

cell coreSub(cell scope, cell args, cell body) {
  int i = eval(scope, first(args))->data.i;
  args = rest(args);
  while (args != Nil) {
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
  if (x == Nil) return Nil;

  if (x->type == CONS) {
    cell op = eval(scope, x->data.c.first);
    if (op == Nil) return Nil;

    cell args = rest(x);
    if (op->type == CORE) {
      return core[op->data.core.i](scope, args, op->data.core.body);
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
  gcInit(1000);

  GC_SCOPE =
    Cons(Symbol("def"), Cons(Core(0, Nil),
    Cons(Symbol("*"), Cons(Core(1, Nil),
    Cons(Symbol("+"), Cons(Core(2, Nil),
    Cons(Symbol("fn"), Cons(Core(3, Nil),
    Cons(Symbol("quote"), Cons(Core(4, Nil),
    Cons(Symbol("if"), Cons(Core(5, Nil),
    Cons(Symbol("eval"), Cons(Core(6, Nil),
    Cons(Symbol("macro"), Cons(Core(7, Nil),
    Cons(Symbol("first"), Cons(Core(10, Nil),
    Cons(Symbol("rest"), Cons(Core(11, Nil),
    Cons(Symbol("list"), Cons(Core(12, Nil),
    Cons(Symbol("cons"), Cons(Core(13, Nil),
    Cons(Symbol("="), Cons(Core(14, Nil),
    Cons(Symbol("prn"), Cons(Core(15, Nil),
    Cons(Symbol("-"), Cons(Core(16, Nil),
    Nil))))))))))))))))))))))))))))));

  while (C != EOF) {
    gcFree();
    printf(" => ");
    cell code = read();
    code = eval(GC_SCOPE, code);
    print(code); printf("\n");
    gcRun();
    printf("\n");
  }
}
