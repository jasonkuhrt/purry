'use strict';
var util = require('util'),
    inspect = util.inspect;
var toArray = require('./utils/to-array');
var error = require('./utils/error');
//TODO should not require something from test folder in lib folder!
var format = require('../test/lib/format');




exports.pins_error = function(){
  return error.syntax('Purry: You cannot use more than one pin per purry instance.');
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
  return error.syntax(
    'Purry: Holes used but too few arguments given '+
    '(expected %d but got %d %s). '+
    'Argue all parameters or use a pin.',
    params_size,
    args.length,
    inspect(toArray(args), {depth:0})
  );
};


exports.no_vargs_support = function(){
  return error('Sorry, Purry does not currently support variable parameter functions.');
};