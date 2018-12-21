(
  (define sum (lambda (n)
               (if (= n 0)
                0
                (+ 1 (sum (- n 1))))))  
 (sum 100))
