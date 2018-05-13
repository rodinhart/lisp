#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include "mem.h"
#include "types.h"

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
  cell xs = Nil(), c = Nil(), first;

  do {
    readSpace();
    if (C == EOF) {
      printf("Missing )\n");
      return Nil();
    }

    if (C == ')') {
      C = getc(stdin);
      return xs;
    }

    first = readCell();
    if (!c) {
      xs = c = Cons(first, Nil());
    } else {
      c->data.c.rest = Cons(first, Nil());
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
  if (C == EOF) return Nil();
  return readCell();
}
