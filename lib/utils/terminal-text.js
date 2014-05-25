'use strict';



exports.stack_pos = stack_pos;
exports.indent = indent;
exports.col = col;
exports.space = space;



function stack_pos(txt){
  return indent(4, txt) + '\n';
}

function indent(size, txt){
  return txt.split('\n').map(function(line){
    return space(size) + line;
  }).join('\n');
}

function col(col1_size, title, txt){
  return title + txt.split('\n')
              .map(function(line, i){
                var spaces = space(i === 0 ? col1_size - title.length : col1_size);
                return  spaces + line ;
              })
              .join('\n');
}

function space(size){
  var acc = '', i = 0;
  while (i++ < size) acc += ' ';
  return acc;
}