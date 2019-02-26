const { Cons, EMPTY } = require("./list.js")

// needed to convert array tuples to proper Cons
const toCons = x => (x instanceof Array ? Cons(x[0], toCons(x[1])) : x)

const read = s => {
  const _ = x => {
    if (!x.length) return null
    const f = x.shift()

    if (f === "undefined") return undefined
    if (f === "null") return null
    if (f === "false") return false
    if (f === "true") return true

    if (String(Number(f)) === f) return Number(f)

    if (f[0] === `"`) return f.substr(1, f.length - 2)

    if (f === "(") {
      const r = [null, EMPTY]
      let c = r
      while (x.length && x[0] !== "." && x[0] !== ")") {
        c[1] = [_(x), EMPTY]
        c = c[1]
      }

      if (x[0] === ".") {
        x.shift()
        c[1] = _(x)
      }

      if (x.shift() !== ")") throw new Error("Missing )")

      return toCons(r[1])
    }

    if (f === "[") {
      const r = []
      while (x.length && x[0] !== "]") {
        r.push(_(x))
      }

      if (x.shift() !== "]") throw new Error("Missing ]")

      return r
    }

    if (f === "{") {
      const r = [Symbol.for("object"), EMPTY]
      let c = r
      while (x.length && x[0] !== "}") {
        c[1] = [_(x), EMPTY]
        c = c[1]
      }

      if (x.shift() !== "}") throw new Error("Missing }")

      return toCons(r)
    }

    if (f === "`") {
      return Cons(Symbol.for("syntax"), Cons(_(x), EMPTY))
    }

    if (f === "~") {
      return Cons(Symbol.for("unquote"), Cons(_(x), EMPTY))
    }

    return Symbol.for(f)
  }

  return _(
    s
      .replace(/\r/g, "")
      .replace(/(;.*\n)/g, "\n")
      .replace(/,/g, " ")
      .replace(/(\(|\)|\[|\]|\{|\}|\`|~)/g, " $1 ")
      .split(/\s/)
      .filter(x => !!x)
  )
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

const endOfFile = name => (stack, buffer, char) => {
  throw new Error(`Unexpected end of file in ${name}`)
}

const unknownChar = name => (stack, buffer, char) => {
  throw new Error(`Unexpected character '${char}' in ${name}`)
}

const returnTerm = tx => (stack, buffer, char) => stack.pop()(tx(buffer))

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

const chart = [
  [
    /EOF/,
    {
      expr: endOfFile("expr"),
      number: returnTerm(Number),
      symbol: returnTerm(getSymbol),
      string: endOfFile("string"),
      list: endOfFile("list"),
      array: endOfFile("array"),
      cons: endOfFile("cons")
    }
  ],
  [
    /[\s,]/,
    {
      expr: (stack, buffer, char) => State("expr", buffer),
      number: returnTerm(Number),
      symbol: returnTerm(getSymbol),
      string: (stack, buffer, char) => State("string", buffer + char),
      list: (stack, buffer, char) => State("list", buffer),
      array: (stack, buffer, char) => State("array", buffer),
      cons: (stack, buffer, char) => State("cons", buffer)
    }
  ],
  [
    /\(/,
    {
      expr: (stack, buffer, char) => {
        stack.push(result => State("DONE", result))

        const t = [null, EMPTY]
        t[0] = t

        return State("list", t)
      },
      number: unknownChar("number"),
      symbol: unknownChar("symbol"),
      string: (stack, buffer, char) => State("string", buffer + char),
      list: (stack, buffer, char) => {
        stack.push(result => {
          buffer[0][1] = [result, EMPTY]
          buffer[0] = buffer[0][1]

          return State("list", buffer)
        })

        t = [null, EMPTY]
        t[0] = t

        return State("list", t)
      },
      array: (stack, buffer, char) => {
        stack.push(result => {
          buffer.push(result)

          return State("array", buffer)
        })

        t = [null, EMPTY]
        t[0] = t

        return State("list", t)
      },
      cons: (stack, buffer, char) => {
        stack.push(result => {
          buffer[0][1] = result
          buffer[0] = null // prevent (a . b b).

          return State("cons", buffer)
        })

        t = [null, EMPTY]
        t[0] = t

        return State("list", t)
      }
    }
  ],
  [
    /\)/,
    {
      expr: unknownChar("expr"),
      number: (stack, buffer, char) => Back(stack.pop()(Number(buffer))),
      symbol: (stack, buffer, char) => Back(stack.pop()(getSymbol(buffer))),
      string: (stack, buffer, char) => State("string", buffer + char),
      list: (stack, buffer, char) => stack.pop()(getList(buffer)),
      array: unknownChar("array"),
      cons: (stack, buffer, char) => stack.pop()(getList(buffer))
    }
  ],
  [
    /\./,
    {
      expr: unknownChar("expr"),
      number: unknownChar("number"),
      symbol: (stack, buffer, char) => State("symbol", buffer + char),
      string: (stack, buffer, char) => State("string", buffer + char),
      list: (stack, buffer, char) => State("cons", buffer),
      array: unknownChar("array"),
      cons: unknownChar("cons")
    }
  ],
  [
    /\[/,
    {
      expr: (stack, buffer, char) => {
        stack.push(result => State("DONE", result))

        return State("array", [])
      },
      number: unknownChar("number"),
      symbol: unknownChar("symbol"),
      string: (stack, buffer, char) => State("string", buffer + char),
      list: (stack, buffer, char) => {
        stack.push(result => {
          buffer[0][1] = [result, EMPTY]
          buffer[0] = buffer[0][1]

          return State("list", buffer)
        })

        return State("array", [])
      },
      array: (stack, buffer, char) => {
        stack.push(result => {
          buffer.push(result)

          return State("array", buffer)
        })

        return State("array", [])
      },
      cons: (stack, buffer, char) => {
        stack.push(result => {
          buffer[0][1] = result
          buffer[0] = null

          return State("cons", buffer)
        })

        return State("array", [])
      }
    }
  ],
  [
    /\]/,
    {
      expr: unknownChar("expr"),
      number: (stack, buffer, char) => Back(stack.pop()(Number(buffer))),
      symbol: (stack, buffer, char) => Back(stack.pop()(getSymbol(buffer))),
      string: (stack, buffer, char) => State("string", buffer + char),
      list: unknownChar("list"),
      array: returnTerm(x => x),
      cons: unknownChar("cons")
    }
  ],
  [
    /[0-9]/,
    {
      expr: (stack, buffer, char) => {
        stack.push(result => State("DONE", result))

        return State("number", char)
      },
      number: (stack, buffer, char) => State("number", buffer + char),
      symbol: (stack, buffer, char) => State("symbol", buffer + char),
      string: (stack, buffer, char) => State("string", buffer + char),
      list: (stack, buffer, char) => {
        stack.push(result => {
          buffer[0][1] = [result, EMPTY]
          buffer[0] = buffer[0][1]

          return State("list", buffer)
        })

        return State("number", char)
      },
      array: (stack, buffer, char) => {
        stack.push(result => {
          buffer.push(result)

          return State("array", buffer)
        })

        return State("number", char)
      },
      cons: (stack, buffer, char) => {
        stack.push(result => {
          buffer[0][1] = result
          buffer[0] = null

          return State("cons", buffer)
        })

        return State("number", char)
      }
    }
  ],
  [
    /"/,
    {
      expr: (stack, buffer, char) => {
        stack.push(result => State("DONE", result))

        return State("string", "")
      },
      number: unknownChar("number"),
      symbol: unknownChar("symbol"),
      string: (stack, buffer, char) => stack.pop()(buffer),
      list: (stack, buffer, char) => {
        stack.push(result => {
          buffer[0][1] = [result, EMPTY]
          buffer[0] = buffer[0][1]

          return State("list", buffer)
        })

        return State("string", "")
      },
      array: (stack, buffer, char) => {
        stack.push(result => {
          buffer.push(result)

          return State("array", buffer)
        })

        return State("string", "")
      },
      cons: (stack, buffer, char) => {
        stack.push(result => {
          buffer[0][1] = result
          buffer[0] = null

          return State("cons", buffer)
        })

        return State("string", "")
      }
    }
  ],
  [
    /./,
    {
      expr: (stack, buffer, char) => {
        stack.push(result => State("DONE", result))

        return State("symbol", char)
      },
      number: unknownChar("number"),
      symbol: (stack, buffer, char) => State("symbol", buffer + char),
      string: (stack, buffer, char) => State("string", buffer + char),
      list: (stack, buffer, char) => {
        stack.push(result => {
          buffer[0][1] = [result, EMPTY]
          buffer[0] = buffer[0][1]

          return State("list", buffer)
        })

        return State("symbol", char)
      },
      array: (stack, buffer, char) => {
        stack.push(result => {
          buffer.push(result)

          return State("array", buffer)
        })

        return State("symbol", char)
      },
      cons: (stack, buffer, char) => {
        stack.push(result => {
          buffer[0][1] = result
          buffer[0] = null

          return State("cons", buffer)
        })

        return State("symbol", char)
      }
    }
  ]
]

// TODO return errors as type, don't throw
// TODO add line/col to errors
const read2 = s => {
  const stack = []
  let state = State("expr")
  for (let i = 0; i <= s.length; i += 1) {
    const char = s[i] || "EOF"
    let j
    for (j = 0; j < chart.length; j += 1) {
      const row = chart[j]
      if (char.match(row[0])) {
        state = row[1][state.name](stack, state.buffer, char)
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

module.exports = read2
