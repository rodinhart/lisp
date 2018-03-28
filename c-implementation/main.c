#include "stdbool.h"
#include "stdio.h"
#include "stdlib.h"

enum { INT, SYMBOL, CONS };

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
  if (GC_FREE == Nil) gcRun();
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
    printf("nil");
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
  }
}

// read :: () -> a
cell read() {
  return Nil;
}

// main :: () -> Int
int main() {
  gcInit(20);
  cell code = Cons(Cons(Symbol("map"), Nil), Cons(Int(44), Nil));
  print(code);
  printf("\n");
  gcFree();
}
