const toHex = x => ("0" + x.toString(16)).substr(-2)

module.exports = {
  toArc: n =>
    "#" +
    [
      17 * ((n & 7) | ((n >>> 1) & 8)),
      17 * ((n & 3) | ((n >>> 3) & 12)),
      17 * ((n & 3) | ((n >>> 1) & 4) | ((n >>> 4) & 8))
    ]
      .map(toHex)
      .join("")
}
