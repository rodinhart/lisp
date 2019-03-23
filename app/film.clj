(import sphere ./sphere.clj)
(import vec ./vector.clj)

(defn gamma (n x)
  (min 255 (.round js/Math (* 255 (.pow js/Math (/ x n) ( / 1 2.2))))))

(defn intersect (ray objects source)
  (fold (fn (best obj)
    (if (= obj source)
      best
      (let [d (sphere/intersect ray obj)]
        (if (and d (or (not best) (< d (get best "d"))))
          { "d" d "obj" obj}
          best))))
    undefined
    objects))

(defn trace (ray objects depth source)
  (let [best (intersect ray objects source)]
    (if (not best)
      [1 1 1] ; sky
      (let [
        obj (get best "obj")
        point (vec/add (get ray "origin") (vec/scale (get ray "direction") (get best "d")))
        colour (get (get best "obj") "colour") ; could depend on point
        ]
        (let [normal (sphere/normal obj point)
              brdf (.random js/Math)]
          (if (< brdf 0.8)
            (vec/mul colour (trace
              { "origin" point "direction" (vec/semi normal) }
              objects
              (+ depth 1)
              obj))
            [0 0 0]))))))
