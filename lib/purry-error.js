'use strict';



function purry_error(factory){
  function do_purry_error(){
    var err = factory.apply(null, arguments);
    if (Error.captureStackTrace) Error.captureStackTrace(err, do_purry_error);
    removeStackCallsite(err, 'purry_wrapper');
    return err;
  }
  return do_purry_error;
}

/*
Remove a stack trace
*/
function removeStackCallsite(err, str_to_match){
  // Some JS environments do not have a
  // stack property on error objects.
  // If we are in such an environment
  // just return err as-is.
  if (err.stack) {
    err.stack = err.stack
      .split('\n')
      .filter(function(frame_str){ return !~frame_str.indexOf(str_to_match); })
      .join('\n');
  }
  return err;
}



module.exports = purry_error;