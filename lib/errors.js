'use strict';
var inspect = require('util').inspect;
var lu = require('./utils/prelude'),
    to_array = lu.to_array,
    space = lu.space;
var getCallerCodeline = require('./utils/get-caller-codeline');
var error = require('./utils/error');
var syntax = require('./syntax');
//TODO should not require something from test folder in lib folder!
var format = require('../test/lib/format');



function too_many_pins(args){
  var codeline = getCallerCodeline(2);
  // TODO get ident ___ string from syntax file.
  var probPointer = colPointer(lastIndexOf('___'), codeline);
  var err = error.syntax(
    'Purry: Only 1 pin allowed per invocation.\n'+
    '\n'+
    '    Remove %d pin(s):\n'+
    '\n'+
    '    %s\n'+
    '    %s\n',
    countPins(args) - 1, codeline, probPointer);
  Error.captureStackTrace(err, too_many_pins);
  return err;
}

exports.too_many_pins = too_many_pins;


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
    inspect(to_array(args), {depth:0})
  );
};


exports.no_vargs_support = function(){
  return error('Sorry, Purry does not currently support variable parameter functions.');
};



// Domain Helpers

var lastIndexOf = function lastIndexOf(thing){
  return function(inStr){
    return inStr.lastIndexOf(thing);
  };
};

function countPins(args){
  return to_array(args).filter(function(x){ return x === syntax.tokens.___; }).length;
}

function colPointer(f, str){
  return space(f(str)) + '^';
}
