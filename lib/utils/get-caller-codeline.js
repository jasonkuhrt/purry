'use strict';

var stackTrace = require('stack-trace');
var fs = require('fs');
var color = require('ansicolors');
var lu = require('./prelude');



function getCallerCodeLine(frameNum, numLinesAround){
  var frame = stackTrace.get(getCallerCodeLine)[frameNum];
  var code;
  try {
    code = fs.readFileSync(frame.getFileName()).toString();
  } catch (err) {
    console.warn('getCallerCodeLine unable to read file %j.', frame.getFileName());
    console.trace(err);
    return '';
  }
  var lineNumber = frame.getLineNumber();
  var seeStart = lineNumber - numLinesAround;
  var seeEnd = lineNumber + numLinesAround;
  var lines = code.split('\n').slice(seeStart, seeEnd);
  lines.forEach(function(line, i){
    var thisLineNumber = seeStart + i + 1;
    var withLineNumber = thisLineNumber + '   ' + line;
    if (thisLineNumber !== lineNumber){
      withLineNumber = color.black(withLineNumber);
    }
    lines[i] = withLineNumber;
  });
  lines.unshift(getFileBase(frame)+'\n');
  lines.unshift(color.black(getFilePath(frame)));
  lines = lines.map(function(x){ return lu.space(4) + x; });
  return lines.join('\n');
}

function getFilePath(frame){
  var path_segments = frame.getFileName().split('/');
  return path_segments.slice(0, path_segments.length - 1).join('/');
}

function getFileBase(frame){
  var segments = frame.getFileName().split('/');
  return segments[segments.length - 1];
}

function show_file_name(file_name){
  var path_segments = file_name.split('/');
  path_segments.splice(path_segments.length - 1, 0, '\n');
  return path_segments.join('/');
}



module.exports = getCallerCodeLine;