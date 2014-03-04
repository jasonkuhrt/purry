'use strict';

var stackTrace = require('stack-trace');
var fs = require('fs');



function getCallerCodeLine(frameNum){
  var frame = stackTrace.get(getCallerCodeLine)[frameNum];
  var code;
  try {
    code = fs.readFileSync(frame.getFileName()).toString();
  } catch (err) {
    console.warn('getCallerCodeLine unable to read file %j.', frame.getFileName());
    console.trace(err);
    return '';
  }
  return code.split('\n')[frame.getLineNumber() - 1].trim();
}



module.exports = getCallerCodeLine;