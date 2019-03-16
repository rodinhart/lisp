(define camera {
  "origin" [0 -4 2]
  "lookAt" [0 0 0]
  "up" [0 0 1]
  "right" [1 0 0] ; should calculate this
})

(define objects [
  { "origin" [0 0 1]
    "radius" 1 ; needs space, otherwise radius is undefined
    "colour" [1 0 0] }
  { "origin" [0 0 -1000]
    "radius" 1000 ; needs space
    "colour" [0 0.5 1.0] }
])
