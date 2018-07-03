(def nil (quote ()))

(def defn (macro x
  (cons (quote def)
    (cons (car x)
      (cons (cons (quote fn)
              (cons (car (cdr x))
                (cons (car (cdr (cdr x)))
                  nil)
              )
            )
      nil)
    )
  )
))

; (seq a b) => (cons a (fn () b))
(def seq (macro x
  (cons (quote cons)
    (cons (car x)
      (cons (cons (quote fn)
              (cons nil
                (cons (car (cdr x))
                nil)
              )
            )
      nil)
    )
  )
))

(def first (fn (s) (car s)))
(defn first (s) (car s))
(defn rest (s) ((cdr s)))

(defn seq2list (s)
  (if s
    (cons (first s) (seq2list (rest s)))
    nil
  )
)

(defn take (n s)
  (if (= n 0)
    nil
    (seq (first s) (take (- n 1) (rest s)))
  )
)

(defn zip (f a b)
  (if a
    (if b
      (seq (f (first a) (first b)) (zip f (rest a) (rest b)))
      nil
    )
    nil
  )
)

(defn drop (n s)
  (if (= n 0)
    s
    (drop (- n 1) (rest s))
  )
)

(def fib (seq 1 (seq 1 (zip + fib (rest fib)))))

(seq2list (take 10 fib))
(seq2list (take 10 (drop 10 fib)))





(def map (fn (f xs)
  (if xs
    (cons (f (car xs)) (map f (cdr xs)))
    xs
  )
))

(def list (macro x
  (cons (quote map)
    (cons (quote eval)
      (cons (cons (quote quote) (cons x nil)) nil)
    )
  )
))

(defn last (xs)
  (if (cdr xs)
    (last (cdr xs))
    (car xs)
  )
)

(def do (macro x
  (cons (quote last)
    (cons (cons (quote map)
            (cons (quote eval)
              (cons (cons (quote quote)
                (cons x nil)
              )
              nil)
            )
          )
    nil)
  )
))

