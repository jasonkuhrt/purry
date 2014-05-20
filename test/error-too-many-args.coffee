describe 'error too many args', ->
  describe 'throws purry_too_many_args iecho6 args outnumber params', ->
    it 'Out-oecho6-bounds holes', ->
      throws (->
        echo6 1, 2, 3, 4, _, _, _, _, _
      ), 'purry_too_many_args'


    it 'Out-oecho6-bounds r2l', ->
      throws (->
        echo6 1, 2, 3, 4, ___, _, _, _, _, _
      ), 'purry_too_many_args'


    it 'Out-oecho6-bounds by 1 value because oecho6 hole', ->
      throws (->
        # 6 is beyond param count which is 4 but 5 args given
        echo6.check echo6(_, 1, 2, _, _, _)(_, 3, 4, 5, 6)(0)
      ), 'purry_too_many_args'


    it '1-pin and 1-hole', ->
      throws (->
        echo6(0, 1, 2, 3, 4, 5, ___) ___, _
      ), 'purry_too_many_args'


    it '1 hole', ->
      throws (->
        echo6(0, 1, 2, 3, 4, 5, ___) _
      ), 'purry_too_many_args'


    it 'except iecho6 delaying via pin', ->
      throws_not(->
        # prime                #delay
        echo6(0, 1, 2, 3, 4, 5, ___)(___)() # exec!
      )


    it 'except iecho6 extra argument is just a pin', ->
      throws_not( ->
        echo6 1, 2, 3, ___, 4, 5, 6
        echo6 ___, 1, 2, 3, 4, 5, 6
        echo6 1, 2, 3, 4, 5, 6, ___
      )