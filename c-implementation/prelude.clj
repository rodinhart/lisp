(def nil (quote ()))

; (list 2 3) -> (cons 2 (list 3)) -> (cons 2 (cons 3 (list)))
(def list (macro x
  (if x
    (cons (quote cons)
      (cons (first x)
        (cons (cons (quote list) (rest x)) nil)
      )
    )
    nil
  )
))

(def defn (macro x (list
  (quote def) (first x) (list (quote fn) (first (rest x)) (first (rest (rest x))))
)))

(defn last (xs)
  (if (rest xs)
    (last (rest xs))
    (first xs)
  )
)

(defn map (f xs)
  (if xs
    (cons (f (first xs)) (map f (rest xs)))
    xs
  )
)
(defn sq (x) (* x x))

(map sq (list 1 2 3 4 5 6 7 8 9 10))

; (first (list ...x))
(def do (macro x (list
  (quote last) (cons (quote list) x)
)))

(defn move (n from to spare)
  (if (= n 0)
    ()
    (do
      (move (- n 1) from spare to)
      (prn (quote move) n (quote from) from (quote to) to)
      (move (- n 1) spare to from)
    )
  )
)

(move 3 (quote A) (quote B) (quote C))

(defn length (n a)
  (if (= n 0)
    a
    (length (- n 1) (+ a 1))
  )
)
