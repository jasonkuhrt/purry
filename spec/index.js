var assert = require('assert');
var purry = require('../');
var test_currying = require('./currying');
var test_partialing = require('./partialing');
var is_result = function(actual) {
  assert.deepEqual([1,2,3,4,5,6], actual);
};


describe('purry', function(){
  test_currying(purry);

  describe('partialing a 6param-function', function(){
    var f = purry(function(a, b, c, d, e, f){ return Array.prototype.slice.apply(arguments); });
    test_partialing(is_result, f);

    describe('mixing currying and partial application', function(){
      it('Delays invocation when partialing or any params unplugged', function(){
        is_result(f(1,_,3)()()(2,4,5)(_)(___)(6));
      });

      it('may curry then partially apply', function(){
        is_result(f(1,2,3,4)(_,6)(5));
      });
    });

    it('Holes count against the param count during invocation thus predictably dropping over-supplied arguments', function(){
      // 7 is dropped, param count is 4 but 5 args given
      is_result(f(_,2,3,_,_,_)(_,4,5,6,7)(1))
    });
  });

  describe('partialing a vparam-function', function(){
    var f = purry(function(){
      return Array.prototype.slice.apply(arguments);
    });

    test_partialing(is_result, f);

    describe('pesky bugs', function(){
      it.skip('Unargued holes are discarded at union time?', function(){
        is_result(f(_,_,_,1,2)(_,_,_,_,4,5,6)(_,_,_,3)());
      });
    });

    describe('implementation details', function(){
      describe('hole-tracking-optimizations do not cause subtle bugs', function(){
        // Holey functions slow performance.
        // Hole-tracking finds the optimal path.
        it('Left-shoulder holes are stored even when following invocation does not interact with left-shoulder', function(){
          is_result(f(_,2,3)(___,6)(1,4,5));
        });

        it('Right-shoulder holes are stored even when following invocation does not interact with right-shoulder', function(){
          is_result(f(___,4,5,_)(1,2,___)(___,6)(3));
        });
      });
    })
  });
});