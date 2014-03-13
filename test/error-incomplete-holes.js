'use strict';
/* globals describe, it, ___, _*/

var assert = require('assert');
var assertErrCode = require('./lib/assert-err-code');

function throws(f){
  assertErrCode(f, 'purry_incomplete_holes');
}

module.exports = function(f){

  describe('throws purry_incomplete_holes given args < params, trailing holes, sans pin', function(){

    it('from the left', function(){
      throws(function(){ f(0, 1, _); });
      throws(function(){ f(0, 1, _, _); });
    });

    it('from the right', function(){
      throws(function(){ f(___, _, 5); });
      throws(function(){ f(___, _, _, 5); });
      throws(function(){ f(0, 1, ___, _, _, 5); });
      // Ok, args count matches param count
      assert.doesNotThrow(function(){ f(0, 1, 2, ___, _, _, 5); });
      // Ok, args count matches param count
      assert.doesNotThrow(function(){ f(_, _, _, ___, _, _, 5); });
    });
  });

};