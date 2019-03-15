(defn add xs (reduce
  (fn ((a b c) (x y z)) [(+ a x) (+ b y) (+ c z)])
  [0 0 0]
  xs))

(defn dot ((a b c) (x y z))
  (+ (* a x) (* b y) (* c z)))

(defn norm (v)
  (let [l (.sqrt js/Math (dot v v))]
    [(/ (v 0) l) (/ (v 1) l) (/ (v 2) l)]))

(defn scale ((x y z) s)
  [(* x s) (* y s) (* z s)])

(defn sub ((a b c) (x y z))
  [(- a x) (- b y) (- c z)])
