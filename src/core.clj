(define apply (lambda (f args) (f . args)))

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
;; TODO? Hide _let1 and _let2 using let :)
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

;; concat sequences
(define concat (let [
  f (lambda (f xs x)
    (if (empty? x)
      (if (empty? xs)
        ()
        (f f (rest xs) (first xs)))
      (seq (first x) (f f xs (rest x)))))
  ]
  (lambda xs
    (f f xs ()))))

;; concat sequences to a list
(define concat_list (lambda xs (apply list (concat . xs))))

;; Destruct an parameter pattern to selector on a concrete argument
(define destruct (lambda (pat arg)
                  (if (atom? pat)
                   (cons arg ())
                   (if (= pat ())
                    ()
                    (concat_list
                     (destruct (car pat) (list (syntax first) arg))
                     (destruct (cdr pat) (list (syntax rest) arg)))))))

;; Flatten a parameter pattern
(define flatten (lambda (pat)
                 (if (atom? pat)
                  (cons pat ())
                  (if (= pat ())
                    ()
                    (concat_list
                      (flatten (car pat))
                      (flatten (cdr pat)))))))

;; Function definition with destructuring
;; (fn (x y) x y) -> (lambda t ((lambda (x y) x y) (first t) (first (rest t))))
(define fn (macro (params . body)
            (list
              `lambda
              `t
              (cons
                (concat_list
                  `(lambda ~(flatten params))
                  body)
                (destruct params `t)))))

;; Convenience macro for defining named functions
;; (defn name params expr1 expr2) -> (define name (fn params expr1 expr2))
(define defn (macro (name params . body)
  (list
    `define
    name
    (concat_list
      (list `fn params)
      body))))

;; Convenience macro for defining macros
(define defmacro (macro (name params . body)
  (list
    `define
    name
    (concat_list
      (list `macro params)
      body))))

;; (and x y) -> ((lambda (z) (if z y z)) x)
(defmacro and (x y)
  
  (list
    (list
      `lambda
      (list (syntax z))
      (list
        (syntax if)
        (syntax z)
        y
        (syntax z)))
    x))

(println (and (do (println "hoi") 2) 3))

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
    (apply list (concat
      (apply list (concat
        (list
          (syntax lambda)
          (list (syntax o)))
        (apply list (map
          (lambda (x) (apply list (concat
            (list (car x) (syntax o))
            (cdr x))))
          xs))))
      (list (syntax o))))
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
