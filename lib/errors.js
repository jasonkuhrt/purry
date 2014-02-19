'use strict';
var util = require('util'),
    inspect = util.inspect,
    sfmt = util.format;
var format = require('../test/lib/format');
var toArray = function toArray(a){ return Array.prototype.slice.apply(a); };



exports.pins_error = function(){
  return syntaxError('Purry: You cannot use more than one pin per purry instance.');
};


exports.too_many_args = function(args, params){
  return error(
    'Purry: Parameters outnumbered by arguments:\n'+
    '    Params (%d): %s\n'+
    ' Arguments (%d): %s',
    params.length,
    format.params(params),
    args.length,
    format.arguments(args)
  );
};


exports.incomplete_holes = function(args, params_size){
  return syntaxError(
    'Purry: Holes used but too few arguments given '+
    '(expected %d but got %d %s). '+
    'Argue all parameters or use a pin.',
    params_size,
    args.length,
    inspect(toArray(args), {depth:0})
  );
};






var error = function error(){
  return new Error(sfmt.apply(null, arguments));
}

var syntaxError = function syntaxError(){
  return new SyntaxError(sfmt.apply(null, arguments));
};