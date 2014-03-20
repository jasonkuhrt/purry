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
  source.dirname = path.dirname(fileName);
  source.basename = path.basename(fileName);
  source.render = render.bind(null, source.lines);
  return source;
}

function render(lines_){
  var lines = lines_.slice();
  // var lines_str = lines.map(function(x){ return lu.space(4) + x; }).join('\n');
  var lines_str = lines.join('\n');
  return lines_str;
}


// Frame helpers

function getSource(frame, numLinesAround){
  var code;
  var source = {
    line: '',
    lines: ''
  };
  try {
    code = fs.readFileSync(frame.getFileName()).toString().split('\n');
  } catch (err) {
    console.warn('getCallerCodeLine unable to read file %j.', frame.getFileName());
    console.trace(err);
    return source;
  }
  var lineNumber = frame.getLineNumber();
  var snipStart = lineNumber - numLinesAround;
  var snipEnd = lineNumber + numLinesAround;
  var lines = code.slice(snipStart, snipEnd);
  lines.forEach(function(line, i){
    var thisLineNumber = snipStart + i + 1;
    var withLineNumber = thisLineNumber + '   ' + line;
    if (thisLineNumber !== lineNumber){
      withLineNumber = color.black(withLineNumber);
    }
    lines[i] = withLineNumber;
  });
  source.lines = lines;
  source.line = lines.slice(numLinesAround-1, numLinesAround)[0];
  return source;
}



module.exports = getCallerCodeLine;