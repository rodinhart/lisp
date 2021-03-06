#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include "mem.h"

int GC_N;
cell GC_MEM;
cell GC_FREE;

cell Nil() {
  return NULL;
}

// gcMark :: Cell -> ()
void gcMark(cell x) {
  if (x == Nil()) return;
  if (x->type == CONS) {
    while (x != Nil() && !x->marked) {
      x->marked = true;
      gcMark(x->data.c.car);
      x = x->data.c.cdr;
    }
  } else if (x->type == FN) {
    while (x != Nil() && !x->marked) {
      x->marked = true;
      gcMark(x->data.c.car);
      x = x->data.c.cdr;
    }
  } else if (x->type == MACRO) {
    while (x != Nil() && !x->marked) {
      x->marked = true;
      gcMark(x->data.c.car);
      x = x->data.c.cdr;
    }
  } else {
    x->marked = true;
  }
}

// gcRun :: Cell -> ()
void gcRun(cell scope) {
  gcMark(scope);

  GC_FREE = Nil();
  for (int i = 0; i < GC_N; i += 1) {
    cell x = GC_MEM + i;
    if (x->marked) {
      x->marked = 0;
    } else {
      x->type = CONS;
      x->data.c.cdr = GC_FREE;
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

  gcRun(Nil());
}

// count :: List a -> Int
int count(cell xs) {
  int count = 0;
  while (xs != Nil()) {
    count += 1;
    xs = xs->data.c.cdr;
  }

  return count;
}

// gcFree :: () -> ()
void gcFree() {
  printf("free: %i / %i\n", count(GC_FREE), GC_N);
}

// gcAlloc :: () -> Cell
cell gcAlloc() {
  // if (GC_FREE == Nil()) gcRun();
  if (GC_FREE == Nil()) {
    printf("Out of memory.\n");
    exit(1);
  }

  cell xs = GC_FREE;
  GC_FREE = xs->data.c.cdr;

  return xs;
}
