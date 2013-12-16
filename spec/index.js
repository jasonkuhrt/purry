var assert = require('assert');
var purry = require('../');



describe('purry', function(){
  var echo = purry(function(a, b, c, d, e, f){ return Array.prototype.slice.apply(arguments); });
  var is_result = function(actual) {
    assert.deepEqual([1,2,3,4,5,6], actual);
  };

  require('./currying')(purry);

  describe('Partially Applying a six-parameter function', function(){

    test_partialing(is_result, echo);

    it('Holes count against the param count during invocation thus predictably dropping over-supplied arguments', function(){
      // 7 is dropped, param count is 4 but 5 args given
      is_result(echo(_,2,3,_,_,_)(_,4,5,6,7)(1))
    });
  });

  describe('Partially Applying a variable-parameter function', function(){
    var f = purry(function(){
      return Array.prototype.slice.apply(arguments);
    });

    test_partialing(is_result, f);

    describe('implementation details', function(){
      describe('hole-tracking-optimizations do not cause subtle bugs', function(){
        // Holey functions slow performance.
        // Hole-tracking finda the optimal path.
        it('Left-shoulder holes are stored even when following invocation does not interact with left-shoulder', function(){
          is_result(f(_,2,3)(___,6)(1,4,5));
        });
        it('Right-shoulder holes are stored even when following invocation does not interact with right-shoulder', function(){
          is_result(f(___,4,5,_)(1,2,___)(___,6)(3));
        });
      });
    })
  });

  test_mixed_curry_partial(is_result, echo);
});



function test_partialing(is_result, f){

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


    describe('delaying', function(){
      it('may delay by partialing holes', function(){
        is_result(f(_)(1,2,3,4,5,6));
        is_result(f(___)(1,2,3,4,5,6));
      });

      it('delays execution repeatedly', function(){
        is_result(f(_)(_)(_)(_)(_)(1,2,3,4,5,6));
        is_result(f(___)(___)(___)(___)(___)(1,2,3,4,5,6));
      });

      it('may arbitrarly mix delay and shoulder', function(){
        is_result(f(1,2,___)(_)(3,4,5,6));
        is_result(f(1,2,___)(___)(3,4,5,6));
      });

      it('may arbitrarly repeatedly mix delay and shoulder', function(){
        is_result(f(1,2,___)(_)(3,4,___)(_)(5,6,___)());
        is_result(f(1,2,___)(___)(3,4,___)(___)(5,6,___)(___)());
      });
    });

    it.skip('drops over-partialed arguments right-to-left', function(){
      is_result(f(1,2,3,4,5,6,7,8,9,10,___)())
    });
    it('throws an error if more than one shoulder is used per partial');
    it('throws an error if used on variable-arguments function');

};



function test_mixed_curry_partial(is_result, pcf){
  describe('mixing currying and partial application', function(){

    it('Delays invocation when partialing or any params unplugged', function(){
      is_result(pcf(1,_,3)()()(2,4,5)(_)(___)(6));
    });

    it('may curry then partially apply', function(){
      is_result(pcf(1,2,3,4)(_,6)(5));
    });

  });
};