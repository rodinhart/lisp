(define list (lambda x x))

(define concat (lambda (xs ys)
                (if xs
                  (cons
                    (car xs)
                    (concat (cdr xs) ys))
    
                  ys)))
  


(define destruct (lambda (pat arg)
                  (if pat
                    (if (atom? pat)
                      (cons arg ())
                      (concat
                        (destruct (car pat) (list (quote car) arg))
                        (destruct (cdr pat) (list (quote cdr) arg))))
      
    
                    ())))
  


(define flatten (lambda (pat)
                 (if pat
                   (if (atom? pat)
                     (cons pat ())
                     (concat
                       (flatten (car pat))
                       (flatten (cdr pat))))
      
    
                   ())))
  


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
    
  


; lazy seq
(defmacro seq (x y) (list
                     (quote cons)
                     x
                     (list
                       (quote lambda)
                       ()
                       y)))
  


(defn first (x) (car x))
(defn rest (z) ((cdr z)))
(defn reify (x) (if x
                 (cons (first x) (reify (rest x)))
                 ()))

(defn take (n x)
  (if (> n 0)
    (seq (first x) (take (- n 1) (rest x)))
    ()))
  


(defn zip (f x y)
  (if x
    (seq (f (first x) (first y)) (zip f (rest x) (rest y)))
    ()))
  


(define fib
  (seq 1 (seq 1 (zip + fib (rest fib)))))


;(reify (take 10 fib))

(defn sum (n a) (if (> n 0) (sum (- n 1) (+ a 1)) a))

(time sum 1000000 0) ; about 19 seconds
