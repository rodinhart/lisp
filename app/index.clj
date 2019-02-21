(import core ../src/core.clj)
(import util ./util.js)

(define canvas (.getElementById js/document "canvas"))
(define g (.getContext canvas "2d"))

(defn identity (x) x)

;; When this is used from a loop, it fails?
(defn do2 xs
  (loop (c xs r undefined)
    (if (empty? c)
      r
      (recur (rest c) (first c)))))

(defn toHex (x)
  (.substr (.join ["0" (.toString x 16)] "") -2))

(define N 256)
(define x -2)
(define y -2)
(define s 4)
(define q (div s N))

(loop (sx 0)
  (if (< sx N)
    (do
      (loop (sy 0)
        (if (< sy N)
          (do
            ((lambda (rx ry)
              (loop (a rx b ry n 255)
                ((lambda (c d)
                  (if (> n 0) ; need and
                    (if (< (+ c d) 4)
                      (recur (+ (- c d) rx) (+ (* 2 a b) ry) (- n 1))
                      (set! g "strokeStyle" (util/toArc n)))
                    (set! g "strokeStyle" (util/toArc n)))
                ) (* a a) (* b b))
            )) (+ x (* q sx)) (+ y (* q sy)))
            (doto g
              ;(set! "strokeStyle" (.join ["#" "00" (toHex sx) (toHex sy)] ""))
              (.beginPath)
              (.rect (+ 0.5 sx) (+ 0.5 sy) 1 1)
              (.stroke))
            (recur (+ sy 1)))
          ()))
      (recur (+ sx 1)))
    ()))