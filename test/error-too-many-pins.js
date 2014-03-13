/* global ___, it */
'use strict';

var assertErrCode = require('./lib/assert-err-code');





module.exports = function(f){

  it('throws too_many_pins error if more than one pin is used', function(){
    assertErrCode(function(){
      f(0,___,1,___,2);
    }, 'purry_too_many_pins');
  });

};