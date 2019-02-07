;; Take a sequence of operands and put them in a list
(define _list (lambda (x)
               (if (isEmpty? x)
                ()
                (cons (first x) (_list (rest x))))))
(define list (lambda x (_list x)))

;; Concatenate two lists
(define concat (lambda (xs ys)
                (if (isEmpty? xs)
                 ys
                 (cons
                  (car xs)
                  (concat (cdr xs) ys)))))

;; Destruct an parameter pattern to selector on a concrete argument
(define destruct (lambda (pat arg)
                  (if (isAtom pat)
                   (cons arg ())
                   (if (isEmpty? pat)
                    ()
                    (concat
                     (destruct (first pat) (list (quote first) arg))
                     (destruct (rest pat) (list (quote rest) arg)))))))

;; Flatten a parameter pattern
(define flatten (lambda (pat)
                 (if (isAtom pat)
                  (cons pat ())
                  (if (isEmpty? pat)
                    ()
                    (concat
                      (flatten (first pat))
                      (flatten (rest pat)))))))

;; Function definition with destructuring
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

;; Convenience macro for defining named functions
(define defn (macro x
              (list
                (quote define)
                (first x)
                (list
                  (quote fn)
                  (first (rest x))
                  (first (rest (rest x)))))))

;; Convenience macro for defining macros
(define defmacro (macro (name params body)
                  (list
                    (quote define)
                    name
                    (list
                      (quote macro)
                      params
                      body))))

;; test
(defn take (n xs)
 (if (> n 0)
  (seq (first xs) (take (- n 1) (rest xs)))
  nil))

(defn zip (f xs ys)
 (seq (f (first xs) (first ys)) (zip f (rest xs) (rest ys))))

(define fib (seq 1 (seq 1 (zip + fib (rest fib)))))

(define first-ten (take 10 fib))

;;(export first-ten)

;; ---
