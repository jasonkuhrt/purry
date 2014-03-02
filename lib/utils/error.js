'use strict';
var format = require('util').format;



function error(){
  return new Error(format.apply(null, arguments));
}

function syntaxError(){
  return new SyntaxError(format.apply(null, arguments));
}



module.exports = error;
module.exports.syntax = syntaxError;