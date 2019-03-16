(import sphere ./sphere.clj)

(defn gamma (n x)
  (min 255 (.round js/Math (* 255 (.pow js/Math (/ x n) ( / 1 2.2))))))

(defn intersect (ray objects source)
  (fold (fn (best obj)
    (if (= obj source)
      best
      (let [d (sphere/intersect ray obj)]
        (if (and d (or (not best) (< d (best "d"))))
          { "d" d "obj" obj}
          best))))
    undefined
    objects))

(defn trace (ray objects depth source)
  (let [best (intersect ray objects source)]
    (if best
      [1 0 0]
      [1 1 1] ; sky
      )))
