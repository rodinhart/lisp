(import camera ./camera.clj)
(import dom ./dom.js)
(import film ./film.clj)
(import outside ./outside.clj)
(import vec ./vector.clj)

(define canvas (.getElementById dom/document "canvas"))
(define W (canvas "width"))
(define H (canvas "height"))

(define state { "n" 0 "photons" [] })

;; init photons
(dom/withImg canvas (fn (x y W H)
  (set! (state "photons") (+ x (* y W)) [0 0 0])
  [0 0 0]))

;; sample
(defn sample ()
  (update! state "n" inc)
  (dom/withSize canvas (fn (x y W H)
    (let [ray (camera/shoot outside/camera (/ (- x (/ (- W H) 2)) H) (/ y H))]
      (let [photon (film/trace ray outside/objects 0 undefined)]
        (update! (state "photons") (+ x (* y W)) (fn (x) (vec/add x photon))))))))

(defn render ()
  (dom/withImg canvas (fn (x y W H)
    (apply array (map
      (fn (p) (film/gamma (state "n") p))
      ((state "photons") (+ x (* y W))))))))

(defn getTime () (.getTime (new js/Date)))

(set! state "time" (getTime))
(defn iterate ()
  ; (sample)
  ; (sample)
  ; (sample)
  (sample)
  (sample)
  (render)
  (log (/ (* (state "n") W H) (- (getTime) (state "time"))) "Ks/s" (state "n") "spp")
  (js/setTimeout iterate 42))

(iterate)
