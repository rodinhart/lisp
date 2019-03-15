const withImg = (canvas, f) => {
  const W = canvas.width
  const H = canvas.height
  const g = canvas.getContext("2d")
  const img = g.getImageData(0, 0, W, H)
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const col = f(x, H - 1 - y, W, H)
      img.data[(x + y * W) * 4 + 0] = col[0]
      img.data[(x + y * W) * 4 + 1] = col[1]
      img.data[(x + y * W) * 4 + 2] = col[2]
      img.data[(x + y * W) * 4 + 3] = 255
    }
  }

  g.putImageData(img, 0, 0)
}

module.exports = {
  document: document,
  withImg
}
