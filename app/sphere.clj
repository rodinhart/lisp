(import vec ./vector.clj)

; sequential let?
(defn intersect (lin sph)
  (let [tmp (vec/sub (get lin "origin") (get sph "origin"))]
    (let [
      b (* 2 (vec/dot (get lin "direction") tmp))
      c (- (vec/dot tmp tmp) (* (get sph "radius") (get sph "radius")))]
        (let [D (- (* b b) (* 4 c))]
          (if (>= D 0)
            (let [d (- (- b) (.sqrt js/Math D))]
              (if (> d 0)
                (/ d 2)
                (let [e (+ (- b) (.sqrt js/Math D))]
                  (if (> d 0)
                    (/ d 2))))))))))

(defn normal (sph point)
  (vec/norm (vec/sub point (get sph "origin"))))
