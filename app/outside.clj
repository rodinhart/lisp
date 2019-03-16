(define camera {
  "origin" [0 -5 0]
  "lookAt" [0 0 0]
  "up" [0 0 1]
  "right" [1 0 0] ; should calculate this
})

(define objects [
  { "origin" [0 0 0]
    "radius" 1 ; needs space, otherwise radius is undefined
    "colour" [0 127 255] }
])
