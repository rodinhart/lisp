(def defn (macro x (list
  (quote def) (first x) (list (quote fn) (first (rest x)) (first (rest (rest x))))
)))

(defn map (f xs)
  (if xs
    (cons (f (first xs)) (map f (rest xs)))
    xs
  )
)
(defn sq (x) (* x x))

(map sq (list 1 2 3 4 5 6 7 8 9 10))

