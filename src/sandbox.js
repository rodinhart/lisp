const sandbox = (x, env) => {
  console.log(x)
  try {
    return eval(x)
  } catch (e) {
    console.log(`Failed to sandbox: ${x}`)
    throw e
  }
}

module.exports = sandbox
