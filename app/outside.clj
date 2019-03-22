(define camera {
  "origin" [0 -8 1]
  "lookAt" [0 0 0.5]
  "up" [0 0 1]
  "right" [1 0 0] ; should calculate this
})

(define objects [
  { "origin" [-3 0 1]
    "radius" 1 ; needs space, otherwise radius is undefined
    "colour" [1 0 0] }
  { "origin" [0 0 1]
    "radius" 1 ; needs space, otherwise radius is undefined
    "colour" [0 1 0] }
  { "origin" [3 0 1]
    "radius" 1 ; needs space, otherwise radius is undefined
    "colour" [0 0 1] }
  { "origin" [0 0 -10000]
    "radius" 10000 ; needs space
    "colour" [1 1 1] }
])
