(define sum (lambda (n a)
  (if (zero? n)
    a
    (sum (+ n -1) (+ a n)))))

(sum 1000 0)

(define sq (lambda (x) (* x x)))
(define map (lambda (f xs)
  (if xs
    (cons (f (car xs)) (map f (cdr xs)))
    xs)))

(define filter (lambda (p xs)
  (if xs
    (if (p (car xs))
      (cons (car xs) (filter p (cdr xs)))
      (filter p (cdr xs)))
    xs)))
(define even (lambda (x)
  (zero? (% x 2))))

(define lst (list 1 2 3 4 5 6 7 8 9 10))
(filter even (map sq lst))
