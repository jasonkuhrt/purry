do_throws = (f) ->
  throws f, 'purry_incomplete_holes'



describe 'error incomplete holes', ->
  describe 'throws purry_incomplete_holes given args < params, trailing holes, sans pin', ->
    it 'from the left', ->
      do_throws -> echo6 0, 1, _
      do_throws -> echo6 0, 1, _, _


    it 'from the right', ->
      do_throws ->
        echo6 ___, _, 5

      do_throws ->
        echo6 ___, _, _, 5

      do_throws ->
        echo6 0, 1, ___, _, _, 5

      # Ok, args count matches param count
      throws_not( ->
        echo6 0, 1, 2, ___, _, _, 5
      )

      # Ok, args count matches param count
      throws_not( ->
        echo6 _, _, _, ___, _, _, 5
      )###
