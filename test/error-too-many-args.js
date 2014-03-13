'use strict';
/* globals ___, _, describe, it */

var assert = require('assert');
var assertErrCode = require('./lib/assert-err-code');



module.exports = function(f){

  describe('throws purry_too_many_args if args outnumber params', function(){
    it('Out-of-bounds holes', function(){
      assertErrCode(function(){
        f(1,2,3,4,_,_,_,_,_);
      }, 'purry_too_many_args');
    });

    it('Out-of-bounds r2l', function(){
      assertErrCode(function(){
        f(1,2,3,4,___,_,_,_,_,_);
      }, 'purry_too_many_args');
    });

    it('Out-of-bounds by 1 value because of hole', function(){
      assertErrCode(function(){
        // 6 is beyond param count which is 4 but 5 args given
        f.check(f(_,1,2,_,_,_)(_,3,4,5,6)(0));
      }, 'purry_too_many_args');
    });

    it('1-pin and 1-hole', function(){
      assertErrCode(function(){
        f(0,1,2,3,4,5,___)(___,_);
      }, 'purry_too_many_args');
    });

    it('1 hole', function(){
      assertErrCode(function(){
        f(0,1,2,3,4,5,___)(_);
      }, 'purry_too_many_args');
    });

    it('except if delaying via pin', function(){
      assert.doesNotThrow(function(){
        f(0,1,2,3,4,5,___)  // prime
        (___)               // delay
        ();                 // exec!
      });
    });

    it('except if extra argument is just a pin', function(){
      assert.doesNotThrow(function(){
        f(1,2,3,___,4,5,6);
        f(___,1,2,3,4,5,6);
        f(1,2,3,4,5,6,___);
      });
    });

  });

};