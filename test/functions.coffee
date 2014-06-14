describe 'purry', ->
  f = undefined

  beforeEach ->
    f = do_create_fixed_echo(6)


  it '() uses .fix if user tunes param count', ->
    eq [1], purry(f, 1)(1)

  it.skip '() uses .vari if user tunes param count to 0', ->
    eq [1], purry(f, 0)(1)

  it '() uses .auto if user does not tune param count', ->
    eq [1,2,3,4,5,6], purry(f)(1)(2)(3)(4)(5)(6)

  it '.fix arbitrarly sets function params to curry', ->
    eq [1], purry.fix(1, f)(1)
    eq [1,2], purry.fix(2, f)(1)(2)
    eq [1,2,3], purry.fix(3, f)(1)(2)(3)

  it '.auto figures out how to apply purry', ->
    eq [1,2,3,4,5,6], purry.auto(f)(1)(2)(3)(4)(5)(6)