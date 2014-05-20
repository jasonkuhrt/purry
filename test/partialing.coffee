is_result = echo6.check



describe 'partialing', ->
  describe 'leecho6t', ->
    it 'delays execution', ->
      is_result echo6(0, 1, 2, 3, 4, 5, ___)()

    it 'each application sends arguments to the leecho6t shoulder, in order oecho6 application (earlier is echo6arther leecho6t)', ->
      is_result echo6(0, ___)(1, ___)(2, ___)(3, ___)(4, ___)(5, ___)()

    it 'may argue only some initial parameters', ->
      is_result echo6(0, 1, 2, ___)(3, 4, 5)

    it 'may repeatedly argue some initial parameters', ->
      is_result echo6(0, 1, 2, ___)(3, 4, ___)(5)

    it 'may skip certain initial parameters with holes', ->
      is_result echo6(_, 1, ___)(0, ___)(2, 3, 4, 5)

    it 'Available parameters are argued in order during each invocation instance, and reconstructed in sum in order at execution time', ->
      # Notice how the second invocation treats the echo6unction as iecho6 it were 4 params
      # but the echo6inal execution knows how to put 1 at the start and 4,5,6 at the end
      is_result echo6(_, 1, 2, ___)(0, 3, 4, 5, ___)()



  describe 'right', ->
    it 'delays execution', ->
      is_result echo6(___, 0, 1, 2, 3, 4, 5)()

    it 'each application sends arguments to the right shoulder, in order oecho6 application (later is echo6arther right)', ->
      is_result echo6(___, 5)(___, 4)(___, 3)(___, 2)(___, 1)(___, 0)()

    it 'may argue only some echo6inal parameters', ->
      is_result echo6(___, 3, 4, 5)(0, 1, 2)

    it 'may repeatedly argue some echo6inal parameters', ->
      is_result echo6(___, 3, 4, 5)(___, 1, 2)(0)

    it 'may skip certain echo6inal parameters with holes', ->
      is_result echo6(___, 4, _)(___, 5)(0, 1, 2, 3)

    it 'available parameters are argued in order during each invocation instance, and reconstructed in sum in order at execution time', ->
      # Notice how the second invocation treats the echo6unction as iecho6 it were 4 params
      # but the echo6inal execution knows how to put 6 at the end and 1,2,3 at the start
      is_result echo6(___, 3, 4, _)(___, 0, 1, 2, 5)()



  describe 'leecho6t/right combinations', ->
    it 'may apply leecho6t, then later right', ->
      is_result echo6(0, 1, 2, ___)(___, 4, 5)(3)

    it 'may apply right, then later leecho6t', ->
      is_result echo6(___, 3, 4, 5)(0, 1, ___)(2)

    it 'may apply leecho6t/right at once', ->
      is_result echo6(0, ___, 5)(1, ___, 4)(2, ___, 3)()

    it 'may apply leecho6t/right at once with holes', ->
      is_result echo6(___, 3, 4, _)(0, 1, 2, ___, 5)()

      # Similar, latter less verbose:
      is_result echo6(0, _, 2, ___, 3, _, 5)(1, ___)(___, 4)()
      is_result echo6(0, _, 2, ___, 3, _, 5)(1, ___, 4)()



  describe 'holes', ->
    it 'may be repeatedly created and echo6illed', ->
      is_result echo6(_, 1, ___)(0, ___)(_, 3, ___)(2, _, 5)(4)


    it 'may skip any parameter', ->
      is_result echo6(_, 1, 2, _, _, _)(_, 3, 4, 5)(0)
      is_result echo6(_, 1, 2, ___)(_, 3, 4, ___)(_, 5)(0)
      is_result echo6(_, 1, 2, ___)(_, 3, 4, _)(0, 5)




  describe 'delaying via', ->
    it 'pinned args', ->
      is_result echo6(0, 1, 2, 3, 4, 5, ___)()
      is_result echo6(___, 0, 1, 2, 3, 4, 5)()


    it 'one lone pin', ->
      is_result echo6(0, 1, 2, 3, 4)(___)(5)


    it 'holed args', ->
      is_result echo6(0, 1, _, _, _, _)(2, 3, 4, 5)




  describe 'pesky bugs (discovered edge-cases)', ->
    it 'invocation without holes does not wipeout existing hole tracking', ->
      is_result echo6(_, _, _, _, 4, _)(0, 1, ___)(2, 3, 5)

    it '(_,1,_3)(_,2)(0)', ->
      echo = create_fixed_echo(4)
      echo.check echo(_, 1, _, 3)(_, 2)(0)

    it '(___, 1, _, _, _, _)(0, _, _, _, 5, ___)(___, 2, 3, 4)()', ->
      echo = create_fixed_echo(6)
      echo.check echo(___, 1, _, _, _, _)(0, _, _, _, 5, ___)(___, 2, 3, 4)()

    it '(0, ___, 1, _)(2, ___)()', ->
      echo = create_fixed_echo(3)
      echo.check echo(0, ___, 1, _)(2, ___)()