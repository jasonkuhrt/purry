values = [0,1,2,3,4,5]



describe 'currying', ->

  it 'Works with 1-parameter functions', ->
    f = purry((x) -> x)
    # Currying effectively does not apply to
    # functions that only accept one argument.
    eq 1, f(1)

  it 'may accept arguments all at once (like "normal")', ->
    echo6.check echo6(0,1,2,3,4,5)

  it 'may accept arguments one at a time', ->
    echo6.check echo6(0)(1)(2)(3)(4)(5)

  it 'may accept arguments multiple at a time', ->
    echo6.check echo6(0)(1,2)(3,4,5)

  it 'may accept no arguments, which causes function to return as-is', ->
    # In each iteration we invoke curried function once needlessly,
    # proving that it returns a function because it isn't primed yet.
    echo6.check echo6(0)()(1,2)()(3,4)()(5)