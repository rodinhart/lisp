(define _list (lambda (x)
               (if (getSeq x)
                (cons (first x) (_list (rest x)))
                nil)))

(define list (lambda x (_list x)))

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
                        (destruct (first pat) (list (quote first) arg))
                        (destruct (rest pat) (list (quote rest) arg))))
                   nil)))

(define flatten (lambda (pat)
                 (if pat
                   (if (isAtom pat)
                     (cons pat ())
                     (concat
                       (flatten (first pat))
                       (flatten (rest pat))))
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
                (first x)
                (list
                  (quote fn)
                  (first (rest x))
                  (first (rest (rest x)))))))

(define defmacro (macro (name params body)
                  (list
                    (quote define)
                    name
                    (list
                      (quote macro)
                      params
                      body))))
    
(define ones (seq 1 ones))

(defn take (n xs)
 (if (gt n 0)
  (seq (first xs) (take (sub n 1) (rest xs)))
  nil))

(defn zip (f xs ys)
 (seq (f (first xs) (first ys)) (zip f (rest xs) (rest ys))))

(define fib (seq 1
             (seq 1 (zip add fib (rest fib)))))

(take 10 fib)
