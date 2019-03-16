(define log (lambda x (.log js/console . x)))

(define apply (lambda (f args) (f . args)))

;; concat sequences
(define concat ((lambda (f)
  (lambda xs
    (f f xs ())))
  (lambda (f xs x)
    (if (empty? x)
      (if (empty? xs)
        ()
        (f f (rest xs) (first xs)))
      (seq (first x) (f f xs (rest x)))))))

;; concat sequences to a list
;; maybe make a specialist version for performance, and so
;; concat can join it's friends map, take etc?
(define concat_list (lambda xs (apply list (concat . xs))))

;; Destruct an parameter pattern to selector on a concrete argument
(define destruct (lambda (pat arg)
                  (if (atom? pat)
                   (cons arg ())
                   (if (= pat ())
                    ()
                    (concat_list
                     (destruct (car pat) (list (quote first) arg))
                     (destruct (cdr pat) (list (quote rest) arg)))))))

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
    (cons `fn (cons (_let1 binds) (list . body)))
    (_let2 binds))))


;; CONDITIONALS

;; (and x y) -> ((lambda (z) (if z y z)) x)
(defmacro and (x y)
  `(let [z ~x]
    (if z ~y z)))

;; (not x)
(defn not (x) (if x false true))

;; (or x y) -> ((lambda (z) (if z z y)) x)
(defmacro or (x y)
  `(let [z ~x]
    (if z z ~y)))

;; (cond p x q y) -> (if p x (if q y))
(defmacro cond xs
  (if (empty? xs)
    undefined
    `(if ~(first xs) ~(first (rest xs))
      ~(concat_list `(cond) (rest (rest xs))))))

;; SEQUENCES
(defn fold (f init xs)
  (if (empty? xs)
    init
    (fold f (f init (first xs)) (rest xs))))

(defn map (f xs)
  (if (empty? xs)
    ()
    (seq (f (first xs)) (map f (rest xs)))
  )
)

(defn reduce (f init xs)
  (if (empty? xs)
    init
    (reduce f (f init (first xs)) (rest xs))))

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

;; IO
(define println (lambda xs (apply log (map prn xs))))


;; INTEROP
(defmacro do xs
  (list (concat_list `(lambda ()) xs)))

;; (doto obj (f x)) -> ((lambda (o) (f o x) o) obj)
;; (doto obj (f x)) -> (let [o obj] (f o x) o)
(defmacro doto (obj . xs)
  (concat_list
    (list `let [`o obj])
    (map
      (lambda (x) (concat_list (list (car x) `o) (cdr x)))
      xs)
    `(o)))


;; TEST

(define fib (seq 1 (seq 1 (zip + fib (rest fib)))))

(define first-ten (take 10 fib))
