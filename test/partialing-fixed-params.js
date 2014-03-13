'use strict';
/* global it, describe, _, ___ */

var util = require('./lib/util'),
    create_fixed_echo = util.create_fixed_echo;



module.exports = function(f){

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