(import core ../src/core.scm)

(define canvas (.getElementById js/document "canvas"))
(define g (.getContext canvas "2d"))

(defn identity (x) x)

;; returns ISeq, not List, needed for returning a form
(defn map (f xs)
  (if (isEmpty? xs)
    ()
    (cons (f (first xs)) (map f (rest xs)))
  )
)

(defn do xs
  (cons (quote list) (map identity xs)))

(defmacro doto (obj . xs)
  (cons
    (quote do)
    (map
      (fn (x) (concat
        (list (car x) obj)
        (cdr x)))
      xs)))

(.beginPath g)
(.moveTo g 100 100)
(.lineTo g 200 150)
(.stroke g)

;(.log js/console (prn (doto (quote g) (quote (.a 1)) (quote (.b 2)))))

(doto g
  (.beginPath)
  (.moveTo 20 30)
  (.lineTo 25 60)
  (.lineTo 70 60)
  (.stroke)
)
