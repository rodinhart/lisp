(import vec ./vector.clj)

(defn shoot (cam x y)
  (let [dir (vec/norm (vec/sub (get cam "lookAt") (get cam "origin")))]
    {
      "origin" (get cam "origin")
      "direction" (vec/norm (vec/add
        (vec/scale dir 2)
        (vec/scale (get cam "right") (- x 0.5))
        (vec/scale (get cam "up") (- y 0.5))))
    }))
