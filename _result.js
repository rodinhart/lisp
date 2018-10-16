const env = { ...require("./primitive.js") }
;(env["_list"] = x =>
  env["isEmpty"](x)
    ? env["EMPTY"]
    : env["cons"](env["first"](x), env["_list"](env["rest"](x)))),
  "_list"
;(env["list"] = (...x) => env["_list"](x)), "list"
;(env["concat"] = (xs, ys) =>
  env["isEmpty"](xs)
    ? ys
    : env["cons"](env["car"](xs), env["concat"](env["cdr"](xs), ys))),
  "concat"
;(env["destruct"] = (pat, arg) =>
  env["isAtom"](pat)
    ? env["cons"](arg, env["EMPTY"])
    : env["isEmpty"](pat)
      ? env["EMPTY"]
      : env["concat"](
          env["destruct"](env["first"](pat), env["list"]("first", arg)),
          env["destruct"](env["rest"](pat), env["list"]("rest", arg))
        )),
  "destruct"
;(env["flatten"] = pat =>
  env["isAtom"](pat)
    ? env["cons"](pat, env["EMPTY"])
    : env["isEmpty"](pat)
      ? env["EMPTY"]
      : env["concat"](
          env["flatten"](env["first"](pat)),
          env["flatten"](env["rest"](pat))
        )),
  "flatten"
;(env["fn"] = Object.assign(
  (params, body) =>
    env["list"](
      "lambda",
      "t",
      env["cons"](
        env["list"]("lambda", env["flatten"](params), body),
        env["destruct"](params, "t")
      )
    ),
  { macro: true }
)),
  "fn"
;(env["defn"] = Object.assign(
  (...x) =>
    env["list"](
      "define",
      env["first"](x),
      env["list"](
        "fn",
        env["first"](env["rest"](x)),
        env["first"](env["rest"](env["rest"](x)))
      )
    ),
  { macro: true }
)),
  "defn"
;(env["defmacro"] = Object.assign(
  (name, params, body) =>
    env["list"]("define", name, env["list"]("macro", params, body)),
  { macro: true }
)),
  "defmacro"
;(env["take"] = (...t) =>
  ((n, xs) =>
    env["gt"](n, 0)
      ? env["Seq"](
          () => env["first"](xs),
          () => env["take"](env["sub"](n, 1), env["rest"](xs))
        )
      : null)(env["first"](t), env["first"](env["rest"](t)))),
  "take"
;(env["zip"] = (...t) =>
  ((f, xs, ys) =>
    env["Seq"](
      () => f(env["first"](xs), env["first"](ys)),
      () => env["zip"](f, env["rest"](xs), env["rest"](ys))
    ))(
    env["first"](t),
    env["first"](env["rest"](t)),
    env["first"](env["rest"](env["rest"](t)))
  )),
  "zip"
;(env["fib"] = env["Seq"](
  () => 1,
  () =>
    env["Seq"](
      () => 1,
      () => env["zip"](env["add"], env["fib"], env["rest"](env["fib"]))
    )
)),
  "fib"
;(env["foobar"] = env["take"](10, env["fib"])), "foobar"

console.log([...env["foobar"]])
