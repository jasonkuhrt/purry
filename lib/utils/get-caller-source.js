'use strict';

var stackTrace = require('stack-trace');
var path = require('path');
var fs = require('fs');
var color = require('ansicolors');
var lu = require('./prelude');



function getCallerCodeLine(frameNum, numLinesAround){
  var frame = stackTrace.get(getCallerCodeLine)[frameNum];
  var source = getSource(frame, numLinesAround);
  var fileName = frame.getFileName();
  source.unshift(path.basename(fileName)+'\n');
  source.unshift(color.black(path.dirname(fileName)));
  source = source.map(function(x){ return lu.space(4) + x; });
  return source.join('\n');
}


// Frame helpers

function getSource(frame, numLinesAround){
  var code;
  try {
    code = fs.readFileSync(frame.getFileName()).toString().split('\n');
  } catch (err) {
    console.warn('getCallerCodeLine unable to read file %j.', frame.getFileName());
    console.trace(err);
    return '';
  }
  var lineNumber = frame.getLineNumber();
  var snipStart = lineNumber - numLinesAround;
  var snipEnd = lineNumber + numLinesAround;
  var snippet = code.slice(snipStart, snipEnd);
  snippet.forEach(function(line, i){
    var thisLineNumber = snipStart + i + 1;
    var withLineNumber = thisLineNumber + '   ' + line;
    if (thisLineNumber !== lineNumber){
      withLineNumber = color.black(withLineNumber);
    }
    snippet[i] = withLineNumber;
  });
  return snippet;
}



module.exports = getCallerCodeLine;