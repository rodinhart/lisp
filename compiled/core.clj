(define nil ())
(define list (lambda x x))

(define concat (lambda (xs ys)
                (if xs
                 (cons
                  (car xs)
                  (concat (cdr xs) ys))
                 ys)))

(define destruct (lambda (pat arg)
                  (if pat
                    (if (isAtom pat)
                      (cons arg ())
                      (concat
                        (destruct (car pat) (list (quote car) arg))
                        (destruct (cdr pat) (list (quote cdr) arg))))
      
    
                    nil)))

(define flatten (lambda (pat)
                 (if pat
                   (if (isAtom pat)
                     (cons pat ())
                     (concat
                       (flatten (car pat))
                       (flatten (cdr pat))))
                   nil)))

(define fn (macro (params body)
            (list
              (quote lambda)
              (quote t)
              (cons
                (list
                  (quote lambda)
                  (flatten params)
                  body)
      
                (destruct params (quote t))))))

(define defn (macro x
              (list
                (quote define)
                (car x)
                (list
                  (quote fn)
                  (car (cdr x))
                  (car (cdr (cdr x)))))))

(define defmacro (macro (name params body)
                  (list
                    (quote define)
                    name
                    (list
                      (quote macro)
                      params
                      body))))
    
(defmacro seq (x y)
 (list (quote cons) x (list (quote lambda) () y)))

(defn first (x) (car x))
(defn rest (z) ((cdr z)))
(defn reify (x) (if x (cons (first x) (reify (rest x))) nil)) ; should be into?

(defn take (n x)
 (if (gt n 0)
  (seq (first x) (take (sub n 1) (rest x)))
  nil))

(defn drop (n x)
 (if (gt n 0)
  (drop (sub n 1) (rest x))
  x))

(defn zip (f x y)
 (if x
  (seq (f (first x) (first y)) (zip f (rest x) (rest y)))
  nil))

(define fib
 (seq 1 (seq 2 (zip add fib (rest fib))))) ; slow, no caching :(

(defn sum (N)
          (loop (n N a 0) ; clash of n otherwise
           (if (gt n 0)
            (recur (sub n 1) (add a 1))
            a)))

((get Math sqrt) 2) ; doesn't work because of LISP calling conventions
