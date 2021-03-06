throws = (f) ->
  a.throws f, /trailing hole/



describe 'error trailing holes', ->
  describe 'throws purry_trailing_holes given args < params, trailing holes, sans pin', ->
    it 'does not throw without warrent', ->
      # Ok, args count matches param count
      a.doesNotThrow -> echo6 0, 1, 2, 3, 4, 5
      # Ok, args count matches param count
      a.doesNotThrow -> echo6 _, _, _, _, _, 5

    describe 'left side', ->
      it '1 trailing hole, full arguments (unreal)', ->
        throws -> echo6 _, ___, 1, 2, 3, 4, 5

      it 'n trailing holes, full arguments (unreal)', ->
        throws -> echo6 _, _, ___, 2, 3, 4, 5

      it '1 trailing hole, incomplete arguments', ->
        throws -> echo6 _
        throws -> echo6 _, ___, 3, 4, 5
        throws -> echo6 0, 1, 2, _
        throws -> echo6 _, 1, 2, _

      it 'n trailing holes, incomplete arguments', ->
        throws -> echo6 _, _
        throws -> echo6 _, _, ___, 3, 4, 5
        throws -> echo6 0, 1, 2, _, _
        throws -> echo6 _, 1, 2, _, _


    describe 'right side', ->
      it '1 trailing hole, full arguments (unreal)', ->
        throws -> echo6 0, 1, 2, 3, 4, ___, _

      it 'n trailing holes, full arguments (unreal)', ->
        throws -> echo6 0, 1, 2, 3, ___, _, _

      it '1 trailing hole, incomplete arguments', ->
        throws -> echo6 ___, _
        throws -> echo6 0, 1, 2, ___, _
        throws -> echo6 ___, _, 3, 4, 5
        throws -> echo6 ___, _, 3, 4, _

      it 'n trailing holes, incomplete arguments', ->
        throws -> echo6 ___, _, _
        throws -> echo6 0, 1, 2, ___, _, _
        throws -> echo6 ___, _, _, 3, 4, 5
        throws -> echo6 ___, _, _, 3, 4, _