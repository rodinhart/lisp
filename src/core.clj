(list
  42
  (quote list)
  ((fn x (list x x x)) 3)
  (def a 10)
  a

  (def rest (fn x (. x slice 1)))
  (rest (list 1 2 3))
  
  (def first (fn x (. (. x slice) shift)))
  (first (quote (1 2 3)))

  (macro defn x (list
    (quote def) (first x) (list (quote fn) (first (rest x)) (first (rest (rest x))))
  ))
  (defn sq x (* x x))
  (sq 10)
  
  ;(eval (quote (* 4 5)))
  
  (defn cons x (fn xs (. (list x) concat xs)))
  (macro apply z ((cons (first z)) (eval (first (rest z)))))
  (def l (list 2 3 5))
  (apply * l)
  
  (defn map f (fn xs (if xs
    ((cons (f (first xs))) ((map f) (rest xs)))
    xs
  )))
  ((map sq) l)
)
