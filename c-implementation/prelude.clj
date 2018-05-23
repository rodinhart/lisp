(def nil (quote ()))

(def map (fn (f xs)
  (if xs
    (cons (f (first xs)) (map f (rest xs)))
    xs
  )
))

(def macroexpand (macro x
  (cons (quote quote)
    (cons (eval (first x))
      nil)
    )
  )
))

(def list (macro x
  (cons (quote map)
    (cons (quote eval)
      (cons (cons (quote quote) (cons x nil)) nil)
    )
  )
))

(def defn (macro x
  (list (quote def) (first x)
    (list (quote fn) (first (rest x)) (first (rest (rest x))))
  )
))

(defn last (xs)
  (if (rest xs)
    (last (rest xs))
    (first xs)
  )
)

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
