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
  (dom/withImg canvas (fn (x y W H)
    (let [ray (camera/shoot outside/camera (/ x W) (/ y H))]
      (let [photon (film/trace ray outside/objects 0 undefined)]
        (apply array (map
          (fn (p) (film/gamma (state "n") p))
          (update! (state "photons") (+ x (* y W)) (fn (x) (vec/add x photon))))))))))

(defn iterate ()
  (sample)
  (println (state "n"))
  (js/setTimeout iterate 10))

(iterate)