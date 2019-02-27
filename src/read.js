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

const app = (stack, name, buffer, char) => State(name, buffer + char)

const eof = (stack, name, buffer, char) => {
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

const skp = (stack, name, buffer, char) => State(name, buffer)

const rej = (stack, name, buffer, char) => {
  throw new Error(`Unexpected character '${char}' in ${name}`)
}

const push = (() => {
  const _ = {
    array: (stack, name, buffer, char) => {
      stack.push(result => {
        buffer.push(result)

        return State("array", buffer)
      })

      return char
    },
    cons: (stack, name, buffer, char) => {
      stack.push(result => {
        buffer[0][1] = result
        buffer[0] = null // prevent (a . b b).

        return State("cons", buffer)
      })

      return char
    },
    expr: (stack, name, buffer, char) => {
      stack.push(result => State("DONE", result))

      return char
    },
    list: (stack, name, buffer, char) => {
      stack.push(result => {
        buffer[0][1] = [result, EMPTY]
        buffer[0] = buffer[0][1]

        return State("list", buffer)
      })

      return char
    },
    object: (stack, name, buffer, char) => {
      stack.push(result => {
        buffer[0][1] = [result, EMPTY]
        buffer[0] = buffer[0][1]

        return State("object", buffer)
      })

      return char
    }
  }

  return (stack, name, buffer, char) => _[name](stack, name, buffer, char)
})()

const arr = pipe(
  push,
  char => State("array", [])
)

const cns = (stack, name, buffer, char) => State("cons", buffer)

const num = pipe(
  push,
  char => State("number", char)
)

const obj = pipe(
  push,
  char => {
    const t = [null, [Symbol.for("object"), EMPTY]]
    t[0] = t[1]

    return State("object", t)
  }
)

const lst = pipe(
  push,
  char => {
    const t = [null, EMPTY]
    t[0] = t

    return State("list", t)
  }
)

const str = pipe(
  push,
  char => State("string", "")
)

const sym = pipe(
  push,
  char => State("symbol", char)
)

const ret = (stack, name, buffer, char) =>
  stack.pop()(
    (() => {
      switch (name) {
        case "number":
          return Number(buffer)

        case "symbol":
          return getSymbol(buffer)

        case "string":
          return buffer

        case "list":
        case "cons":
        case "object":
          return toCons(buffer[1])

        case "array":
          return buffer

        default:
          throw new Error(`No ret for ${name}`)
      }
    })()
  )

const end = pipe(
  ret,
  Back
)

// prettier-ignore
const chart = {
  _:    [ /EOF/, /[\s,]/, /\(/, /\)/, /\./, /\[/, /\]/, /\{/, /\}/, /[0-9]/, /"/, /./ ],
  expr: [  eof,   skp,     lst,  rej,  rej,  arr,  rej,  obj,  rej,  num,     str, sym],
  number: [ret,   ret,     rej,  end,  rej,  rej,  end,  rej,  end,  app,     rej, rej],
  symbol: [ret,   ret,     rej,  end,  app,  rej,  end,  rej,  end,  app,     rej, app],
  string: [eof,   app,     app,  app,  app,  app,  app,  app,  app,  app,     ret, app],
  list: [  eof,   skp,     lst,  ret,  cns,  arr,  rej,  obj,  rej,  num,     str, sym],
  cons: [  eof,   skp,     lst,  ret,  rej,  arr,  rej,  obj,  rej,  num,     str, sym],
  array: [ eof,   skp,     lst,  rej,  rej,  arr,  ret,  obj,  rej,  num,     str, sym],
  object: [eof,   skp,     lst,  rej,  rej,  arr,  rej,  obj,  ret,  num,     str, sym]
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
