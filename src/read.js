const { Cons, EMPTY } = require("./list.js")

// needed to convert array tuples to proper Cons
const toCons = x => (x instanceof Array ? Cons(x[0], toCons(x[1])) : x)

const pipe = (...fns) => (...args) => {
  let r = fns[0](...args)
  for (let i = 1; i < fns.length; i += 1) {
    r = fns[i](r)
  }

  return r
}

const State = (name, buffer) => ({
  name,
  buffer
})

function Back(state) {
  if (!(this instanceof Back)) {
    return new Back(state)
  }

  this.state = state
}

const append = (stack, name, buffer, char) => State(name, buffer + char)

const endOfFile = (stack, name, buffer, char) => {
  throw new Error(`Unexpected end of file in ${name}`)
}

const getSymbol = x => {
  switch (x) {
    case "undefined":
      return undefined

    case "null":
      return null

    case "false":
      return false

    case "true":
      return true

    default:
      return Symbol.for(x)
  }
}

const getList = x => toCons(x[1])

const ignore = (stack, name, buffer, char) => State(name, buffer)

const returnTerm = tx => (stack, name, buffer, char) => stack.pop()(tx(buffer))

const setupArray = (stack, name, buffer, char) => {
  stack.push(result => {
    buffer.push(result)

    return State("array", buffer)
  })

  return char
}

const setupCons = (stack, name, buffer, char) => {
  stack.push(result => {
    buffer[0][1] = result
    buffer[0] = null // prevent (a . b b).

    return State("cons", buffer)
  })

  return char
}

const setupDone = (stack, name, buffer, char) => {
  stack.push(result => State("DONE", result))

  return char
}

const setupList = (stack, name, buffer, char) => {
  stack.push(result => {
    buffer[0][1] = [result, EMPTY]
    buffer[0] = buffer[0][1]

    return State("list", buffer)
  })

  return char
}

const startArray = char => State("array", [])

const startNumber = char => State("number", char)

const startList = char => {
  const t = [null, EMPTY]
  t[0] = t

  return State("list", t)
}

const startString = char => State("string", "")

const startSymbol = char => State("symbol", char)

const unknownChar = (stack, name, buffer, char) => {
  throw new Error(`Unexpected character '${char}' in ${name}`)
}

const chart = {
  _: [/EOF/, /[\s,]/, /\(/, /\)/, /\./, /\[/, /\]/, /[0-9]/, /"/, /./],
  expr: [
    endOfFile,
    ignore,
    pipe(
      setupDone,
      startList
    ),
    unknownChar,
    unknownChar,
    pipe(
      setupDone,
      startArray
    ),
    unknownChar,
    pipe(
      setupDone,
      startNumber
    ),
    pipe(
      setupDone,
      startString
    ),
    pipe(
      setupDone,
      startSymbol
    )
  ],
  number: [
    returnTerm(Number),
    returnTerm(Number),
    unknownChar,
    pipe(
      returnTerm(Number),
      Back
    ),
    unknownChar,
    unknownChar,
    pipe(
      returnTerm(Number),
      Back
    ),
    append,
    unknownChar,
    unknownChar
  ],
  symbol: [
    returnTerm(getSymbol),
    returnTerm(getSymbol),
    unknownChar,
    pipe(
      returnTerm(getSymbol),
      Back
    ),
    append,
    unknownChar,
    pipe(
      returnTerm(getSymbol),
      Back
    ),
    append,
    unknownChar,
    append
  ],
  string: [
    endOfFile,
    append,
    append,
    append,
    append,
    append,
    append,
    append,
    returnTerm(x => x),
    append
  ],
  list: [
    endOfFile,
    ignore,
    pipe(
      setupList,
      startList
    ),
    returnTerm(getList),
    (stack, name, buffer, char) => State("cons", buffer),
    pipe(
      setupList,
      startArray
    ),
    unknownChar,
    pipe(
      setupList,
      startNumber
    ),
    pipe(
      setupList,
      startString
    ),
    pipe(
      setupList,
      startSymbol
    )
  ],
  cons: [
    endOfFile,
    ignore,
    pipe(
      setupCons,
      startList
    ),
    returnTerm(getList),
    unknownChar,
    pipe(
      setupCons,
      startArray
    ),
    unknownChar,
    pipe(
      setupCons,
      startNumber
    ),
    pipe(
      setupCons,
      startString
    ),
    pipe(
      setupCons,
      startSymbol
    )
  ],
  array: [
    endOfFile,
    ignore,
    pipe(
      setupArray,
      startList
    ),
    unknownChar,
    unknownChar,
    pipe(
      setupArray,
      startArray
    ),
    returnTerm(x => x),
    pipe(
      setupArray,
      startNumber
    ),
    pipe(
      setupArray,
      startString
    ),
    pipe(
      setupArray,
      startSymbol
    )
  ]
}

// TODO return errors as type, don't throw
// TODO add line/col to errors
const read = s => {
  const stack = []
  let state = State("expr")
  for (let i = 0; i <= s.length; i += 1) {
    const char = s[i] || "EOF"
    const row = chart[state.name]
    let j
    for (j = 0; j < row.length; j += 1) {
      if (char.match(chart._[j])) {
        state = row[j](stack, state.name, state.buffer, char)
        break
      }
    }

    if (j === chart.length) throw new Error(`Unknown character '${char}'`)

    if (state instanceof Back) {
      state = state.state
      i -= 1
    }

    if (state.name === "DONE") {
      return state.buffer
    }
  }

  throw new Error("Beyond end of file")
}

module.exports = read
