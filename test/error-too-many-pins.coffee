


describe 'error too many pins', ->

  it 'throws too_many_pins error if more than one pin is used', ->
    a.throws (->
      echo6 0, ___, 1, ___, 2
    ), /only 1 is allowed/