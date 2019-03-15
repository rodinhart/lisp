(defn gamma (n, x)
  (min 255 (.round js/Math (* 255 (.pow js/Math (/ x n) ( / 1 2.2))))))