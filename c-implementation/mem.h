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

cell Nil();
void gcInit(int);
void gcFree();
cell gcAlloc();