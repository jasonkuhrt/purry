describe 'partialing a fixed-params-function', ->

  it '(_, 1, 2, 3, 4, 5, 6, ___, 7, _)()()(0, 8)', ->
    e9 = create_fixed_echo(9)
    e9.check e9(_, 1, 2, 3, 4, 5, 6, ___, 7, _)()()(0, 8)

  it '(_, _, _, 3, ___)(0)(_, 2, 4, 5)(1, 6)', ->
    e7 = create_fixed_echo(7)
    e7.check e7(_, _, _, 3, ___)(0)(_, 2, 4, 5, ___)(1, 6)

  describe 'curry/partial mixing', ->
    it 'delays invocation when partialing or any params unplugged', ->
      echo6(0, _, 2, ___)()()(1, 3, 4)(_)(___)(5)

    it 'may curry then partially apply', ->
      echo6.check echo6(0, 1, 2, 3)(_, 5)(4)