/* global _, it */
'use strict';

var assertErrCode = require('./lib/assert-err-code');





module.exports = function(f){

  // TODO:
  it.skip('throws delaying_with_hole error given a single hole argument', function(){
    assertErrCode(function(){
      f(_);
    }, 'purry_delaying_with_hole');
  });

};