/* global it, describe, _, ___ */
'use strict';
var assert = require('assert');
var util = require('./lib/util'),
    create_fixed_echo = util.create_fixed_echo;



module.exports = function(f){
  describe('throws if args outnumber params', function(){
    it('Out-of-bounds holes', function(){
      assert.throws_too_many_args(function(){
        f(1,2,3,4,_,_,_,_,_);
      });
    });

    it('Out-of-bounds r2l', function(){
      assert.throws_too_many_args(function(){
        f(1,2,3,4,___,_,_,_,_,_);
      });
    });

    it('Out-of-bounds by 1 value because of hole', function(){
      assert.throws_too_many_args(function(){
        // 6 is beyond param count which is 4 but 5 args given
        f.check(f(_,1,2,_,_,_)(_,3,4,5,6)(0));
      });
    });

    it('1 pin', function(){
      assert.throws_too_many_args(function(){
        f(0,1,2,3,4,5,___)(___);
      });
    });

    it('1 hole', function(){
      assert.throws_too_many_args(function(){
        f(0,1,2,3,4,5,___)(_);
      });
    });

  });

  describe('curry/partial mixing', function(){
    it('delays invocation when partialing or any params unplugged', function(){
      f.check(f(0,_,2,___)()()(1,3,4)(_)(___)(5));
    });

    it('may curry then partially apply', function(){
      f.check(f(0,1,2,3)(_,5)(4));
    });
  });

  it('(_, 1, 2, 3, 4, 5, 6, ___, 7, _)()()(0, 8)', function(){
    var f = create_fixed_echo(9);
    f.check(f(_, 1, 2, 3, 4, 5, 6, ___, 7, _)()()(0, 8));
  });

  it('(_, _, _, 3, ___)(0)(_, 2, 4, 5)(1, 6)', function(){
    var f = create_fixed_echo(7);
    f.check(f(_, _, _, 3, ___)(0)(_, 2, 4, 5, ___)(1, 6));
  });
};