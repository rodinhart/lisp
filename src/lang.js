const thread = (x, fs) => fs.reduce((x, f) => f(x), x)

module.exports = {
  thread
}
