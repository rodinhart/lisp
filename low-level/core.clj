(define defm (macro (name args body)
  (list 'define name (list 'macro args body))))

(defm defn (name args body)
  (list 'define name (list 'lambda args body)))

(defn last (xs)
  (if xs
    (if (cdr xs)
      (last (cdr xs))
      (car xs))
    xs))

(defn memo (fn)
  ((lambda (cache)
    (lambda ()
      (if (car cache)
        (car cache)
        ((lambda (t) (car cache)) (setcar! cache (fn))))))
    (cons () ())))

(defm seq (a b)
  (list 'list a (list 'memo (list 'lambda () b))))
(defn first (x) (car x))
(defn rest (x) ((car (cdr x))))
(defn to-list (xs)
  (if xs
    (cons (first xs) (to-list (rest xs)))
    xs))
(defn take (n xs)
  (if xs
    (if (zero? n)
      ()
      (seq (first xs) (take (+ n -1) (rest xs))))
    xs))

(defn zip (f xs ys)
  (seq (f (first xs) (first ys)) (zip f (rest xs) (rest ys))))

(define l (seq 1 (seq 1 (zip + l (rest l)))))
(to-list (take 15 l))

