'use strict';

var stackTrace = require('stack-trace');
var fs = require('fs');



function getCallerCodeLine(frameNum){
  var frame = stackTrace.get(getCallerCodeLine)[frameNum];
  var code = fs.readFileSync(frame.getFileName()).toString();
  return code.split('\n')[frame.getLineNumber() - 1].trim();
}



module.exports = getCallerCodeLine;