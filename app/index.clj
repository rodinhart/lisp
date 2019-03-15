(import camera ./camera.clj)
(import dom ./dom.js)
(import film ./film.clj)
(import outside ./outside.clj)

(define canvas (.getElementById dom/document "canvas"))
(define W (canvas "width"))
(define H (canvas "height"))

(define state { "n" 0 "photons" [] })

;; init photons
(dom/withImg canvas (fn (x y W H)
  (set! (state "photons") (+ x (* y W)) 0)
  [255 127 63]))

;; sample
(dom/withImg canvas (fn (x y W H)
  (log (camera/shoot
    outside/camera
    (/ x W)
    (/ y H)))
  [0 0 0]))
