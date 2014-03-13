/* global _, ___, it, describe */
'use strict';
var assert = require('assert');
var util = require('./lib/util');



module.exports = function(is_result, f){






  describe('left', function(){
    it('delays execution', function(){
      is_result(f(0,1,2,3,4,5,___)());
    });

    it('each application sends arguments to the left shoulder, in order of application (earlier is farther left)', function(){
      is_result(f(0,___)(1,___)(2,___)(3,___)(4,___)(5,___)());
    });

    it('may argue only some initial parameters', function(){
      is_result(f(0,1,2,___)(3,4,5));
    });

    it('may repeatedly argue some initial parameters', function(){
      is_result(f(0,1,2,___)(3,4,___)(5));
    });

    it('may skip certain initial parameters with holes', function(){
      is_result(f(_,1,___)(0,___)(2,3,4,5));
    });

    it('Available parameters are argued in order during each invocation instance, and reconstructed in sum in order at execution time', function(){
      // Notice how the second invocation treats the function as if it were 4 params
      // but the final execution knows how to put 1 at the start and 4,5,6 at the end
      is_result(f(_,1,2,___)(0,3,4,5,___)());
    });

  });


  describe('right', function(){
    it('delays execution', function(){
      is_result(f(___,0,1,2,3,4,5)());
    });

    it('each application sends arguments to the right shoulder, in order of application (later is farther right)', function(){
      is_result(f(___,5)(___,4)(___,3)(___,2)(___,1)(___,0)());
    });

    it('may argue only some final parameters', function(){
      is_result(f(___,3,4,5)(0,1,2));
    });

    it('may repeatedly argue some final parameters', function(){
      is_result(f(___,3,4,5)(___,1,2)(0));
    });

    it('may skip certain final parameters with holes', function(){
      is_result(f(___,4,_)(___,5)(0,1,2,3));
    });

    it('available parameters are argued in order during each invocation instance, and reconstructed in sum in order at execution time', function(){
      // Notice how the second invocation treats the function as if it were 4 params
      // but the final execution knows how to put 6 at the end and 1,2,3 at the start
      is_result(f(___,3,4,_)(___,0,1,2,5)());
    });
  });


  describe('left/right combinations', function(){
    it('may apply left, then later right', function(){
      is_result(f(0,1,2,___)(___,4,5)(3));
    });

    it('may apply right, then later left', function(){
      is_result(f(___,3,4,5)(0,1,___)(2));
    });

    it('may apply left/right at once', function(){
      is_result(f(0,___,5)(1,___,4)(2,___,3)());
    });

    it('may apply left/right at once with holes', function(){
      is_result(f(___,3,4,_)(0,1,2,___,5)());
      // Similar, latter less verbose:
      is_result(f(0,_,2,___,3,_,5)(1,___)(___,4)());
      is_result(f(0,_,2,___,3,_,5)(1,___,4)());
    });
  });

  describe('holes', function(){
    it('may be repeatedly created and filled', function(){
      is_result(f(_,1,___)(0,___)(_,3,___)(2,_,5)(4));
    });

    it('may skip any parameter', function(){
      is_result(f(_,1,2,_,_,_)(_,3,4,5)(0));
      is_result(f(_,1,2,___)(_,3,4,___)(_,5)(0));
      is_result(f(_,1,2,___)(_,3,4,_)(0,5));
    });
  });


  describe('delaying via', function(){
    it('pinned args', function(){
      is_result(f(0,1,2,3,4,5,___)());
      is_result(f(___,0,1,2,3,4,5)());
    });

    it('one lone pin', function(){
      is_result(f(0,1,2,3,4)(___)(5));
    });

    it('holed args', function(){
      is_result(f(0,1,_,_,_,_)(2,3,4,5));
    });
  });


  describe('pesky bugs (discovered edge-cases)', function(){
    it('invocation without holes does not wipeout existing hole tracking', function(){
      is_result(f(_,_,_,_,4,_)(0,1,___)(2,3,5));
    });

    it('(_,1,_3)(_,2)(0)', function(){
      var echo = util.create_fixed_echo(4);
      echo.check(echo(_,1,_,3)(_,2)(0));
    });

    it('(___, 1, _, _, _, _)(0, _, _, _, 5, ___)(___, 2, 3, 4)()', function(){
      var echo = util.create_fixed_echo(6);
      echo.check(echo(___, 1, _, _, _, _)(0, _, _, _, 5, ___)(___, 2, 3, 4)());
    });

    it('(0, ___, 1, _)(2, ___)()', function(){
      var echo = util.create_fixed_echo(3);
      echo.check(echo(0, ___, 1, _)(2, ___)());
    });
  });
};