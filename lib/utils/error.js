module.exports = error;
module.exports.discard_callsite = discard_callsite;




function error(o){
  var err = new Error();
  Object.keys(o).forEach(function(k){
    err[k] = o[k];
  });
  if (Error.captureStackTrace) Error.captureStackTrace(err, error);
  return err;
}


/*
Remove a stack trace
*/
function discard_callsite(err, matcher){
  // Some JS environments do not have a
  // stack property on error objects.
  // If we are in such an environment
  // just return err as-is.
  if (err.stack) {
    err.stack = err.stack
      .split('\n')
      .filter(function(frame_str){
        return !matcher.test(frame_str);
      })
      .join('\n');
  }
  return err;
}