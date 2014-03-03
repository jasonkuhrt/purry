'use strict';
var format = require('util').format;



function error(){
  var err = new Error(format.apply(null, arguments));
  Error.captureStackTrace(err, error);
  return err;
}

function syntaxError(){
  var err = new SyntaxError(format.apply(null, arguments));
  Error.captureStackTrace(err, syntaxError);
  return err;
}



module.exports = error;
module.exports.syntax = syntaxError;