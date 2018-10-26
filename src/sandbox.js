const sandbox = (x, env) => {
  try {
    return eval(x)
  } catch (e) {
    console.log(`Failed to sandbox: ${x}`)
    throw e
  }
}

module.exports = sandbox
