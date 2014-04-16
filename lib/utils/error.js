'use strict';



function error(msg){
  var err = new Error(msg);
  Error.captureStackTrace(err, error);
  return err;
}

function syntaxError(msg){
  var err = new SyntaxError(msg);
  Error.captureStackTrace(err, syntaxError);
  return err;
}



module.exports = error;
module.exports.syntax = syntaxError;