var assert = require('assert');
var parry = require('../');
GLOBAL._ = parry._;
GLOBAL.___ = parry.___;



var test_currying = function(is_result, cf){
  describe('currying', function(){

    it('may accept all arguments at once', function(){
      is_result(cf(1,2,3,4,5,6));
    });

    it('may accept all arguments incrementally', function(){
      is_result(cf(1)(2)(3)(4)(5)(6));
    });

    it('may accept some arguments incrementally', function(){
      is_result(cf(1,2,3)(4,5,6));
      is_result(cf(1)(2,3,4,5)(6))
    });

    it('returns as-is if invoked without arguments', function(){
      is_result(cf()()()()(1)(2)(3)(4)(5)()()()(6))
    });

  });
};



var test_partialing = function(r, pf){
  describe('partial application', function(){

    it('may repeatedly shoulder each argument', function(){
      r(pf(1,___)(2,___)(3,___)(4,___)(5,___)(6,___)());
      r(pf(___,6)(___,5)(___,4)(___,3)(___,2)(___,1)(), 'right');
    });

    it('may shoulder some arguments', function(){
      r(pf(1,2,3,___)(4,5,6));
      r(pf(___,4,5,6)(1,2,3));
    });

    it('may repeatedly shoulder some arguments', function(){
      r(pf(1,2,3,___)(4,5,___)(6));
      r(pf(___,4,5,6)(___,2,3)(1));
    });

    it('may repeatedly shoulder some arguments in different directions', function(){
      r(pf(1,2,3,___)(___,5,6)(4));
      r(pf(___,4,5,6)(1,2,___)(3));
    });

    it('may delay by partialing holes', function(){
      r(pf(_)(1,2,3,4,5,6));
      r(pf(___)(1,2,3,4,5,6));
    });

    it('may repeatedly delay', function(){
      r(pf(_)(_)(_)(_)(_)(1,2,3,4,5,6));
      r(pf(___)(___)(___)(___)(___)(1,2,3,4,5,6));
    });

    it('may arbitrarly mix delay and shoulder', function(){
      r(pf(1,2,___)(_)(3,4,5,6));
      r(pf(1,2,___)(___)(3,4,5,6));
    });

    it('may arbitrarly repeatedly mix delay and shoulder', function(){
      r(pf(1,2,___)(_)(3,4,___)(_)(5,6,___)());
      r(pf(1,2,___)(___)(3,4,___)(___)(5,6,___)(___)());
    });

    it('may shoulder partials', function(){
      r(pf(_,2,___)(1,___)(3,4,5,6));
      r(pf(___,5,_)(___,6)(1,2,3,4));
    });

    it('may partial intermediaries', function(){
      r(pf(_,2,3,_,_,_)(_,4,5,6)(1))
      r(pf(_,2,3,___)(_,4,5)(1,6))
    });

    it('intermediary partial defaults to left shoulder, not strictly checked against param count,', function(){
      // Note: omitting ,___ or ,_,_ after 4
      r(pf(_,2,_,4)(1,3,5,6));
    });

    it('plugs are constants, conflicting indexes from new args are moved opposite the shoulder', function(){
      // Note: 1,4,... instead of: 1,_,_,4,...
      r(pf(_,2,3,___)(1,4,5,6,___)())
      r(pf(___,4,5,_)(___,1,2,3,6)())
    });

    it('may partial intermediaries, and to either shoulder at once', function(){
      r(pf(___,4,5,_)(1,2,3,___,6)())
      r(pf(1,___,6)(2,___,5)(3,___,4)())
      // Similar, latter less verbose:
      r(pf(1,_,3,___,4,_,6)(2,___)(___,5)())
      r(pf(1,_,3,___,4,_,6)(2,___,5)())
    });

    it.skip('drops over-partialed arguments right-to-left', function(){
      r(pf(1,2,3,4,5,6,7,8,9,10,___)())
    });

    it('Holes count against the param count during invocation thus predictably leading to drops', function(){
      // 7 is dropped, param count is 4 but 5 args given
      r(pf(_,2,3,_,_,_)(_,4,5,6,7)(1))
    });

    it('throws an error if more than one shoulder is used per partial');

    it('throws an error if used on variable-arguments function');

  });
};



var test_mixed_curry_partial = function(is_result, pcf){
  describe('mixing currying and partial application', function(){

    it('Delays invocation when partialing or any params unplugged', function(){
      is_result(pcf(1,_,3)()()(2,4,5)(_)(___)(6));
    });

    it('may curry then partially apply', function(){
      is_result(pcf(1,2,3,4)(_,6)(5));
    });

  });
};



describe('parry', function(){
  var calc = function(a, b, c, d, e, f){ return Array.prototype.slice.apply(arguments); }
  var calc_ = parry(calc);
  var is_result = function(actual){
    assert.deepEqual([1,2,3,4,5,6], actual);
  };

  test_currying(is_result, calc_);
  test_partialing(is_result, calc_);
  test_mixed_curry_partial(is_result, calc_);
});