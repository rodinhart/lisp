#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define SYMBOL_LENGTH 16

// Type system

typedef enum
{
  INT,
  SYMBOL,
  CONS,
  NATIVE
} Type;

// TODO check size of this thing
typedef struct _object
{
  Type type;
  union {
    int i;
    char s[SYMBOL_LENGTH];
    struct
    {
      struct _object *a;
      struct _object *b;
    } c;
    struct _object *(*f)(struct _object *);
  };
  char marked;
} Object;

#define HEAP_SIZE 10000
Object *heap = NULL;
Object *freePtr;
int freeLen;

void mark(Object *p)
{
  if (p == NULL || p->marked == 1)
  {
    return;
  }

  p->marked = 1;

  if (p->type != CONS)
  {
    return;
  }

  mark(p->c.a);
  mark(p->c.b);
}

void GC(Object *p)
{
  mark(p);

  int was = freeLen;
  freePtr = NULL;
  freeLen = 0;
  for (int i = 0; i < HEAP_SIZE; i += 1)
  {
    p = heap + i;
    if (p->marked == 1)
    {
      p->marked = 0;
    }
    else
    {
      p->type = CONS; // needed?
      p->c.a = NULL;  // needed?
      p->c.b = freePtr;
      freePtr = p;
      freeLen += 1;
    }
  }

  printf("\nWas: %d, Free: %d\n", was, freeLen);
}

Object *allocate()
{
  if (heap == NULL)
  {
    heap = (Object *)malloc(HEAP_SIZE * sizeof(Object));
    GC(NULL);
  }

  if (freePtr == NULL)
  {
    printf("Heap overflow!\n");
    exit(1);
  }

  Object *x = freePtr;
  freePtr = freePtr->c.b;
  freeLen -= 1;

  return x;
}

Object *Int(int i)
{
  Object *x = allocate();
  x->type = INT;
  x->i = i;

  return x;
}

Object *Symbol(char s[SYMBOL_LENGTH])
{
  Object *x = allocate();
  x->type = SYMBOL;
  for (int i = 0; i < SYMBOL_LENGTH; i += 1)
  {
    x->s[i] = s[i];
  }

  return x;
}

Object *Cons(Object *a, Object *b)
{
  Object *x = allocate();
  x->type = CONS;
  x->c.a = a;
  x->c.b = b;

  return x;
}

Object *Native(Object *f(Object *))
{
  Object *x = allocate();
  x->type = NATIVE;
  x->f = f;

  return x;
}

// Native procedures

Object *plus(Object *xs)
{
  int r = 0;

  while (xs != NULL)
  {
    r = r + xs->c.a->i;
    xs = xs->c.b;
  }

  return Int(r);
}

Object *mul(Object *xs)
{
  int r = 1;

  while (xs != NULL)
  {
    r = r * xs->c.a->i;
    xs = xs->c.b;
  }

  return Int(r);
}

Object *isZero(Object *xs)
{
  if (xs->c.a->i == 0)
  {
    return xs;
  }
  else
  {
    return NULL;
  }
}

Object *list(Object *xs)
{
  return xs;
}

Object *cons(Object *xs)
{
  return Cons(xs->c.a, xs->c.b->c.a);
}

Object *car(Object *xs)
{
  return xs->c.a->c.a;
}

Object *cdr(Object *xs)
{
  return xs->c.a->c.b;
}

Object *mod(Object *xs)
{
  return Int(xs->c.a->i % xs->c.b->c.a->i);
}

// Reader

#define gc() getc(stdin)

int c;

void readSpace()
{
  while (c != EOF && isspace(c))
  {
    c = gc();
  }
}

Object *readInt()
{
  char buf[20];
  buf[0] = c;
  int i = 1;
  for (c = gc(); c != EOF && !isspace(c) && c != '(' && c != ')'; c = gc())
  {
    buf[i] = c;
    i += 1;
  }

  buf[i] = 0;

  return Int(atoi(buf));
}

Object *readSymbol()
{
  char buf[SYMBOL_LENGTH];
  buf[0] = c;
  int i = 1; // isterm?
  for (c = gc(); c != EOF && !isspace(c) && c != '(' && c != ')'; c = gc())
  {
    buf[i] = c;
    i += 1;
  }

  buf[i] = 0;

  return Symbol(buf);
}

Object *readExpr();
Object *readList()
{
  c = gc(); // skip (
  readSpace();
  Object *result = Cons(NULL, NULL);
  Object *current = result;
  while (c != EOF && c != ')')
  {
    current->c.b = Cons(readExpr(), NULL);
    current = current->c.b;
    readSpace();
  }

  if (c == EOF)
  {
    printf("Missing )\n");
    exit(1);
  }

  c = gc(); // skip )

  return result->c.b;
}

Object *readExpr()
{
  if (c == EOF)
    return NULL;

  if (c == '(')
    return readList();

  if (isdigit(c) || c == '-')
    return readInt();

  return readSymbol();
}

Object *read()
{
  c = gc();
  readSpace();

  return readExpr();
}

// Printer

void prn(Object *x)
{
  if (x == NULL)
  {
    printf("()");
    return;
  }

  switch (x->type)
  {
  case INT:
    printf("%i", x->i);
    break;

  case SYMBOL:
    printf("%s", x->s);
    break;

  case CONS:
    if (x->c.b != NULL &&
        x->c.b->c.a->type == SYMBOL &&
        strcmp(x->c.b->c.a->s, "lambda") == 0)
    {
      printf("[PROCEDURE]");
      return;
    }

    printf("(");
    int sep = 0;
    while (x != NULL)
    {
      if (sep == 1)
      {
        printf(" ");
      }
      else
      {
        sep = 1;
      }

      prn(x->c.a);
      x = x->c.b;
    }

    printf(")");
    break;

  case NATIVE:
    printf("[PROC]");
    break;
  }
}

// Stack
Object *stack = NULL;
int stackLen = 0;

void push(Object *x)
{
  if (stackLen == 100)
  {
    printf("\nStack overflow!\n");
    exit(1);
  }

  stack = Cons(x, stack);
  stackLen += 1;
}

Object *pop()
{
  stackLen -= 1;
  Object *r = stack->c.a;
  stack = stack->c.b;

  return r;
}

Object *expr;
Object *env;
Object *res;
Object *op;
Object *args;

void evalArgs();

void eval()
{
start:
  if (expr == NULL)
  {
    res = NULL;
    return;
  }

  if (freeLen < 16)
  {
    push(expr);
    push(env);
    GC(stack);
    env = pop();
    expr = pop();
  }

  switch (expr->type)
  {
  case INT:
    res = expr;
    return;

  case SYMBOL:
    while (env != NULL)
    {
      if (strcmp(env->c.a->s, expr->s) == 0)
      {
        res = env->c.b->c.a;
        return;
      }

      env = env->c.b->c.b;
    }

    printf("Unknown symbol %s\n", expr->s);
    exit(1);
    return;

  case CONS:
    if (expr->c.a->type == SYMBOL)
    {
      if (strcmp(expr->c.a->s, "lambda") == 0)
      {
        res = Cons(env, expr);
        return;
      }

      if (strcmp(expr->c.a->s, "if") == 0)
      {
        push(expr);
        push(env);
        expr = expr->c.b->c.a;
        eval();
        env = pop();
        expr = pop();
        if (res == NULL)
        {
          expr = expr->c.b->c.b->c.b->c.a;
        }
        else
        {
          expr = expr->c.b->c.b->c.a;
        }

        goto start;
      }

      if (strcmp(expr->c.a->s, "define") == 0)
      {
        push(expr);
        push(env);
        expr = expr->c.b->c.b->c.a;
        eval();
        env = pop();
        expr = pop();
        while (env->c.b != NULL)
        {
          env = env->c.b;
        }

        env->c.b = Cons(expr->c.b->c.a, Cons(res, NULL));
        res = expr->c.b->c.a;
        return;
      }
    }

    // get op
    push(expr);
    push(env);
    expr = expr->c.a;
    eval();
    env = pop();
    expr = pop();

    // get arguments
    push(res);
    expr = expr->c.b;
    evalArgs();
    op = pop();

    // apply operator
    if (op->type == NATIVE)
    {
      res = op->f(args);
      return;
    }

    // (env lambda (x y) y)
    env = op->c.a;
    op = op->c.b->c.b;
    expr = op->c.a;
    while (expr != NULL)
    {
      env = Cons(args->c.a, env);
      env = Cons(expr->c.a, env);
      args = args->c.b;
      expr = expr->c.b;
    }

    expr = op->c.b->c.a;
    goto start;
  }
}

void evalArgs()
{
  if (expr == NULL)
  {
    args = NULL;
    return;
  }

  push(expr);
  expr = expr->c.b;
  evalArgs();
  expr = pop();
  push(args);
  expr = expr->c.a;
  push(env);
  eval();
  env = pop();
  args = pop();
  args = Cons(res, args);
}

Object *def(Object *res, Object *symbol, Object *value)
{
  return Cons(symbol, Cons(value, res));
}

int main(void)
{
  printf("\nWelcome to LISP\n");
  Object *core = NULL;
  core = def(core, Symbol("+"), Native(plus));
  core = def(core, Symbol("*"), Native(mul));
  core = def(core, Symbol("zero?"), Native(isZero));
  core = def(core, Symbol("list"), Native(list));
  core = def(core, Symbol("cons"), Native(cons));
  core = def(core, Symbol("car"), Native(car));
  core = def(core, Symbol("cdr"), Native(cdr));
  core = def(core, Symbol("%"), Native(mod));
  push(core);

  while (1)
  {
    printf("    ");
    expr = read();
    if (c == EOF)
      break;
    env = core;
    eval();
    prn(res);
    printf("\n");
  }

  return 0;
}
