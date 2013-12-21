var purry = require('../');
var util = require('./util');
var test_currying = require('./currying');
var test_partialing = require('./partialing');

var create_fixed_echo = util.create_fixed_echo;



describe('purry', function(){
  test_currying(purry);

  describe('partialing a 6param-function', function(){
    var f = create_fixed_echo(6)
    test_partialing(f.check, f);

    describe('mixing currying and partial application', function(){
      it('Delays invocation when partialing or any params unplugged', function(){
        f.check(f(1,_,3)()()(2,4,5)(_)(___)(6));
      });

      it('may curry then partially apply', function(){
        f.check(f(1,2,3,4)(_,6)(5));
      });
    });

    it('(_, _, _, 4)(1)(_, 3, 5, 6)(2, 7)', function(){
      var f = create_fixed_echo(7)
      f.check(f(_, _, _, 4)(1)(_, 3, 5, 6)(2, 7));
    });

    it('Holes count against the param count during invocation thus predictably dropping over-supplied arguments', function(){
      // 7 is dropped, param count is 4 but 5 args given
      f.check(f(_,2,3,_,_,_)(_,4,5,6,7)(1))
    });
  });

  describe('partialing a vparam-function', function(){
    var f = util.create_vparam_echo(6);

    test_partialing(f.check, f);

    describe('implementation details', function(){
      describe('hole-tracking-optimizations do not cause subtle bugs', function(){
        // Holey functions slow performance.
        // Hole-tracking finds the optimal path.
        it('Left-shoulder holes are stored even when following invocation does not interact with left-shoulder', function(){
          f.check(f(_,2,3)(___,6)(1,4,5));
        });

        it('Right-shoulder holes are stored even when following invocation does not interact with right-shoulder', function(){
          f.check(f(___,4,5,_)(1,2,___)(___,6)(3));
        });
      });
    })
  });
});