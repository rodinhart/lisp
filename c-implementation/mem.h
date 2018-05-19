enum { INT, SYMBOL, CONS, FN, MACRO, CORE };

typedef struct _cell {
  union {
    int i;
    char s[16];
    struct {
      struct _cell *first;
      struct _cell *rest;
    } c;
    struct _cell *(*fn)(struct _cell *, struct _cell *);
  } data;
  unsigned int type : 4;
  unsigned int marked : 1;
} *cell;

typedef cell (*core)(cell, cell);

cell Nil();
void gcInit(int);
void gcFree();
cell gcAlloc();
