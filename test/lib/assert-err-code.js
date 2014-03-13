'use strict';

var assert = require('assert');



function assertErrCode(f, code, msg){
  assert.throws(f, function(err){
    return err.code === code;
  }, msg);
}



module.exports = assertErrCode;