(import vec ./vector.clj)

(defn shoot (cam x y)
  (let [dir (vec/norm (vec/sub (cam "lookAt") (cam "origin")))]
    {
      "origin" (cam "origin")
      "direction" (vec/norm (vec/add
        (vec/scale dir 2)
        (vec/scale (cam "right") (- x 0.5))
        (vec/scale (cam "up") (- y 0.5))))
    }))
