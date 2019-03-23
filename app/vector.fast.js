const X = [1, 0, 0]
const Y = [0, 1, 0]

const add = (...xs) =>
  xs.reduce(([a, b, c], [x, y, z]) => [a + x, b + y, c + z], [0, 0, 0])

const cross = ([a, b, c], [x, y, z]) => [
  b * z - c * y,
  c * x - a * z,
  a * y - b * x
]

const dot = ([a, b, c], [x, y, z]) => a * x + b * y + c * z

const len = v => Math.sqrt(dot(v, v))

const mul = ([a, b, c], [x, y, z]) => [a * x, b * y, c * z]

const norm = v => {
  const l = len(v)

  return [v[0] / l, v[1] / l, v[2] / l]
}

const scale = ([x, y, z], s) => [x * s, y * s, z * s]

const semi = n => {
  const t = cross(n, X)
  const u = iszero(t) ? norm(cross(n, Y)) : norm(t)
  const v = cross(u, n)
  const r2 = Math.random()
  const phi = 2 * Math.PI * Math.random()

  return add(
    scale(u, Math.cos(phi) * Math.sqrt(r2)),
    scale(v, Math.sin(phi) * Math.sqrt(r2)),
    scale(n, Math.sqrt(1 - r2))
  )
}

const sub = ([a, b, c], [x, y, z]) => [a - x, b - y, c - z]

const iszero = ([x, y, z]) => x === 0 && y === 0 && z === 0

module.exports = {
  X,
  Y,
  add,
  cross,
  dot,
  len,
  mul,
  norm,
  scale,
  semi,
  sub,
  "zero?": iszero
}
