#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define SYMBOL_LENGTH 16

typedef enum
{
  INT,
  SYMBOL,
  CONS,
  NATIVE
} Type;

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
} Object;

Object *allocate()
{
  Object *x = (Object *)malloc(sizeof(Object));

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
    printf("(");
    while (x != NULL)
    {
      prn(x->c.a);
      printf(" ");
      x = x->c.b;
    }

    printf(")");
    break;

  case NATIVE:
    printf("[PROC]");
    break;
  }
}

Object *stack[100];
int sp = 100;
void push(Object *x)
{
  if (sp == 0)
  {
    printf("\nStack overflow!\n");
    exit(1);
  }

  sp -= 1;
  stack[sp] = x;
}

Object *pop()
{
  sp += 1;
  return stack[sp - 1];
}

// TODO check regs with SICP
Object *expr;
Object *env;
Object *res;
Object *op;
Object *args;

void evalArgs();

void eval()
{
  if (expr == NULL)
  {
    res = NULL;
    return;
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
    printf("\n");
    eval();
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

int main(void)
{
  printf("\nWelcome to LISP\n");
  Object *core = Cons(Symbol("+"), Cons(Native(plus), NULL));

  Object *code = Cons(
      Cons(Symbol("lambda"),
           Cons(Cons(Symbol("x"), Cons(Symbol("y"), NULL)),
                Cons(Symbol("y"), NULL))),
      Cons(Int(3), Cons(Int(4), NULL)));

  expr = code;
  env = core;
  eval();
  prn(res);
  printf("\n");

  return 0;
}
