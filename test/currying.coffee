lo = require("lodash")
apply = (xs, f) ->
  f.apply null, xs

apply0 = (f) ->
  f()

apply1 = (x, f) ->
  f x

flip2 = (f) ->
  (x, y) ->
    f y, x

add64 = (x) ->
  x + 64

chunk_grow1 = (array) ->
  return [] if array.length is 0
  return [array] if array.length is 1
  from = 0
  take = 1
  takei = from + take
  chunks = []
  while takei < array.length
    takei = from + take
    chunks.push array.slice(from, takei)
    from = takei
    take++
  chunks

from_char_code = String.fromCharCode
to_argument_names = lo.partialRight(lo.map, lo.compose(from_char_code, add64))




values = [1,2,3,3,4,5,6]
is_result = lo.partial(eq, values)
echo = new Function(to_argument_names(values).join(","), "return Array.prototype.slice.apply(arguments);")
f = purry(echo)
describe "currying", ->

  # Implied rules:
  # - executes immediately after all parameters have been argued
  it "Works with 1-parameter functions", ->
    eq 1, purry((x) -> x)(1)

  it "may accept arguments all at once (like \"normal\")", ->
    is_result apply(values, f)

  it "may accept arguments one at a time", ->
    is_result values.reduce(flip2(apply1), f)

  it "may accept arguments multiple at a time", ->
    is_result chunk_grow1(values).reduce(flip2(apply), f)

  it "may accept no arguments, which causes function to return as-is", ->
    do_reduce = (f, x) ->
      apply1 x, apply0(f)

    is_result values.reduce(do_reduce, f)