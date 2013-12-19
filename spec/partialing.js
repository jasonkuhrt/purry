var assert = require('assert');
var util = require('./util');



module.exports = function(is_result, f){

  it.skip('drops over-partialed arguments right-to-left', function(){
    is_result(f(1,2,3,4,5,6,7,8,9,10,___)())
  });

  it('throws an error if >1 pin used in an instance', function(){
    var err_message;
    try {
      f(1,___,2,___,3);
    } catch(err) {
      err_message = err.message;
    } finally {
      assert(/^(You cannot use)/.test(err_message));
    }
  });


  describe('left', function(){
    it('delays execution', function(){
      is_result(f(1,2,3,4,5,6,___)());
    });

    it('each application sends arguments to the left shoulder, in order of application (earlier is farther left)', function(){
      is_result(f(1,___)(2,___)(3,___)(4,___)(5,___)(6,___)());
    });

    it('may argue only some initial parameters', function(){
      is_result(f(1,2,3,___)(4,5,6));
    });

    it('may repeatedly argue some initial parameters', function(){
      is_result(f(1,2,3,___)(4,5,___)(6));
    });

    it('may skip certain initial parameters with holes', function(){
      is_result(f(_,2,___)(1,___)(3,4,5,6));
    });

    it('Available parameters are argued in order during each invocation instance, and reconstructed in sum in order at execution time', function(){
      // Notice how the second invocation treats the function as if it were 4 params
      // but the final execution knows how to put 1 at the start and 4,5,6 at the end
      is_result(f(_,2,3,___)(1,4,5,6,___)())
    });

  });


  describe('right', function(){
    it('delays execution', function(){
      is_result(f(___,1,2,3,4,5,6)());
    });

    it('each application sends arguments to the right shoulder, in order of application (later is farther right)', function(){
      is_result(f(___,6)(___,5)(___,4)(___,3)(___,2)(___,1)());
    });

    it('may argue only some final parameters', function(){
      is_result(f(___,4,5,6)(1,2,3));
    });

    it('may repeatedly argue some final parameters', function(){
      is_result(f(___,4,5,6)(___,2,3)(1));
    });

    it('may skip certain final parameters with holes', function(){
      is_result(f(___,5,_)(___,6)(1,2,3,4));
    });

    it('available parameters are argued in order during each invocation instance, and reconstructed in sum in order at execution time', function(){
      // Notice how the second invocation treats the function as if it were 4 params
      // but the final execution knows how to put 6 at the end and 1,2,3 at the start
      is_result(f(___,4,5,_)(___,1,2,3,6)());
    });
  });


  describe('left/right combinations', function(){
    it('may apply left, then later right', function(){
      is_result(f(1,2,3,___)(___,5,6)(4));
    });

    it('may apply right, then later left', function(){
      is_result(f(___,4,5,6)(1,2,___)(3));
    });

    it('may apply left/right at once', function(){
      is_result(f(1,___,6)(2,___,5)(3,___,4)())
    });

    it('may apply left/right at once with holes', function(){
      is_result(f(___,4,5,_)(1,2,3,___,6)())
      // Similar, latter less verbose:
      is_result(f(1,_,3,___,4,_,6)(2,___)(___,5)())
      is_result(f(1,_,3,___,4,_,6)(2,___,5)())
    });
  });

  describe('holes', function(){
    it('may be repeatedly created and filled', function(){
      is_result(f(_,2)(1,___)(_,4)(3,_,6)(5))
    });

    it('defaults to left shoulder, not strictly checked against param count', function(){
      // Note: omitting ,___ or ,_,_ after 4
      is_result(f(_,2,_,4)(1,3,5,6));
    });

    it('may skip any parameter', function(){
      is_result(f(_,2,3,_,_,_)(_,4,5,6)(1));
      is_result(f(_,2,3)(_,4,5)(_,6)(1));
      is_result(f(_,2,3)(_,4,5)(1,6));
    });
  });


  describe('delaying with', function(){

    it('pinned args', function(){
      is_result(f(1,2,3,4,5,6,___)());
      is_result(f(___,1,2,3,4,5,6)());
    });

    it('holed args', function(){
      is_result(f(1,2,_)(3,4,5,6));
    });

    it('1 pin', function(){
      is_result(f(1,2,3,4,5,6,___)(___)());
      is_result(f(1,2,3,4,5,6,___)(___)(___)());
    });

    it('1 hole', function(){
      is_result(f(1,2,3,4,5,6,___)(_)());
      is_result(f(1,2,3,4,5,6,___)(_)(_)());
    });

    it('>1 holes', function(){
      is_result(f(1,2,3,4,5,6,___)(_,_,_)());
      is_result(f(1,2,3,4,5,6,___)(_,_)(_,_)());
    });

    // >1 pins
    // N/A: would be an error

    it('(crazy) pinned/holed args instances mixed with 1/>1 pins/holes', function(){
      is_result(f(1,2,___)(_)(3,4,_)(_)(_)(5,6,___)(_,_)());
      is_result(f(1,2,___)(___)(3,4,_)(___)(___)(5,6,___)(___)());
    });
  });


  describe('pesky bugs (discovered edge-cases)', function(){
    it.skip('Unargued holes are discarded at union time?', function(){
      f.check(f(_,_,_,1,2)(_,_,_,_,4,5,6)(_,_,_,3)());
    });

    it('invocation without holes does not wipeout existing hole tracking', function(){
      is_result(f(_,_,_,_,5,_)(1,2,___)(3,4,6));
    });

    it('(_,2,_4)(_,3)(1)', function(){
      var echo = util.create_fixed_echo(4);
      echo.check(echo(_,2,_,4)(_,3)(1));
    });
  });
};