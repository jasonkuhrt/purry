'use strict';



function purry_error(factory){
  function do_purry_error(){
    var err = factory.apply(null, arguments);
    Error.captureStackTrace(err, do_purry_error);
    remove_purry_wrapper_trace(err);
    return err;
  }
  return do_purry_error;
}

function remove_purry_wrapper_trace(err){
  err.stack = err.stack.split('\n').filter(function(x){
    return !~x.indexOf('purry_wrapper');
  }).join('\n');
  return err;
}



module.exports = purry_error;