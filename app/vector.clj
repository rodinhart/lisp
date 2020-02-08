(define X [1 0 0])
(define Y [0 1 0])

(define add (lambda xs (reduce
  (fn ((a b c) (x y z)) [(+ a x) (+ b y) (+ c z)])
  [0 0 0]
  xs)))

(defn cross ((a b c) (x y z))
  [(- (* b z) (* c y))
   (- (* c x) (* a z))
   (- (* a y) (* b x))])

(defn dot ((a b c) (x y z))
  (+ (* a x) (* b y) (* c z)))

(define len (lambda (v)
  (.sqrt js/Math (dot v v))))

(defn mul (( a b c) (x y z))
  [(* a x) (* b y) (* c z)])

(define norm (lambda (v)
  (let [l (len v)]
    [(/ (get v 0) l) (/ (get v 1) l) (/ (get v 2) l)])))

(defn scale ((x y z) s)
  [(* x s) (* y s) (* z s)])

(define semi (lambda (n)
  (let [t (cross n X)]
    (let [u (if (zero? t) (norm (cross n Y)) (norm t))]
      (let [v (cross u n)
            r2 (.random js/Math)
            phi (* 2 js/Math/PI (.random js/Math))]
        (add
          (scale u (* (.cos js/Math phi) (.sqrt js/Math r2)))
          (scale v (* (.sin js/Math phi) (.sqrt js/Math r2)))
          (scale n (.sqrt js/Math (- 1 r2)))))))))

(defn sub ((a b c) (x y z))
  [(- a x) (- b y) (- c z)])

(defn zero? ((x y z))
  (and (= x 0) (and (= y 0) (= z 0))))
