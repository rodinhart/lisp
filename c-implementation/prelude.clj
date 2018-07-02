(def nil (quote ()))

(def defn (macro x
  (cons (quote def)
    (cons (first x)
      (cons (cons (quote fn)
              (cons (first (rest x))
                (cons (first (rest (rest x)))
                  nil)
              )
            )
      nil)
    )
  )
))

(def map (fn (f xs)
  (if xs
    (cons (f (first xs)) (map f (rest xs)))
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
  (if (rest xs)
    (last (rest xs))
    (first xs)
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

