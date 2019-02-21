(define log (lambda (x) (.log js/console x)))
(define println (lambda (x) (.log js/console (prn x))))

;; Take a sequence of operands and put them in a list
(define _list (lambda (x)
               (if (empty? x)
                ()
                (cons (first x) (_list (rest x))))))
(define list (lambda x (_list x)))

;; (let [x 28 y 14] (println x) (println y) (+ x y))
;; ((lambda (x y)
;;   (println x)
;;   (println y)
;;   (+ x y))
;; 28 14)
(define _let1 (lambda (binds)
  (if (empty? binds)
    ()
    (cons (first binds) (_let1 (rest (rest binds)))))))

(define _let2 (lambda (binds)
  (if (empty? binds)
    ()
    (cons (first (rest binds)) (_let2 (rest (rest binds)))))))

(define let (macro (binds . body)
  (cons
    (cons `lambda (cons (_let1 binds) (list . body)))
    (_let2 binds))))

;; Concatenate two lists
;; TODO concat two sequences to List
(define _concat (lambda (xs ys)
                (if (= xs ())
                 ys
                 (cons
                  (car xs)
                  (_concat (cdr xs) ys)))))

;; Destruct an parameter pattern to selector on a concrete argument
(define destruct (lambda (pat arg)
                  (if (atom? pat)
                   (cons arg ())
                   (if (= pat ())
                    ()
                    (_concat
                     (destruct (car pat) (list (quote first) arg))
                     (destruct (cdr pat) (list (quote rest) arg)))))))

;; Flatten a parameter pattern
(define flatten (lambda (pat)
                 (if (atom? pat)
                  (cons pat ())
                  (if (= pat ())
                    ()
                    (_concat
                      (flatten (car pat))
                      (flatten (cdr pat)))))))

;; Function definition with destructuring
(define fn (macro (params . body)
            (list
              (quote lambda)
              (quote t)
              (cons
                (_concat
                  (list
                   (quote lambda)
                   (flatten params))
                  (_list body))
                (destruct params (quote t))))))

;; Convenience macro for defining named functions
;; (defn f (x y . z) z)
(define defn (macro (name params . body)
              (list
                (quote define)
                name
                (_concat
                  (list
                    (quote fn)
                    params)
                  (_list body)))))

;; Convenience macro for defining macros
(define defmacro (macro (name params . body)
                  (list
                    (quote define)
                    name
                    (_concat
                      (list
                        (quote macro)
                        params)
                      (_list body)))))

(defn apply (f args) (f . args))

;; (and x y) -> ((lambda (z) (if z y z)) x)
(defmacro and (x y)
  (list
    (list
      (quote lambda)
      (list (quote z))
      (list
        (quote if)
        (quote z)
        y
        (quote z)))
    x))

;; (or x y) -> ((lambda (z) (if z z y)) x)
(defmacro or (x y)
  (syntax ((lambda (z) (if z z (unquote y))) (unquote x))))

(defn map (f xs)
  (if (empty? xs)
    ()
    (seq (f (first xs)) (map f (rest xs)))
  )
)

;; (doto obj (f x)) -> ((lambda (o) (f o x) o) obj)
(defmacro doto (obj . xs)
  (list
    (_concat
      (_concat
        (list
          (quote lambda)
          (list (quote o)))
        (apply list (map
          (lambda (x) (_concat
            (list (car x) (quote o))
            (cdr x)))
          xs)))
      (list (quote o)))
    obj))

;; take n from sequence
(defn take (n xs)
 (if (> n 0)
  (seq (first xs) (take (- n 1) (rest xs)))
  ()))

;; zip two sequences using function
;; make into variadic map
(defn zip (f xs ys)
  (if (empty? xs)
    ()
    (if (empty? ys)
      ()
      (seq (f (first xs) (first ys)) (zip f (rest xs) (rest ys))))))

(define fib (seq 1 (seq 1 (zip + fib (rest fib)))))

(define first-ten (take 10 fib))
