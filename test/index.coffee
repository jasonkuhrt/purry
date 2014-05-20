describe 'purry', ->

  it '.purryFix arbitrarly sets function params to curry', ->
    f = do_create_fixed_echo(6)
    eq [1], purry.purryFix(1, f)(1)
    eq [1,2], purry.purryFix(2, f)(1)(2)
    eq [1,2,3], purry.purryFix(3, f)(1)(2)(3)

  it '.purryAuto figures out how to apply purry', ->
    f = do_create_fixed_echo(6)
    eq [1,2,3,4,5,6], purry.purryAuto(f)(1)(2)(3)(4)(5)(6)
    eq [1], purry.purryAuto(f, 1)(1)