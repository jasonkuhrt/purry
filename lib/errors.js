'use strict';
var util = require('util'),
    inspect = util.inspect;
var funargs = require('args-list');
var lu = require('./utils/prelude'),
    to_array = lu.to_array,
    space = lu.space;
var getCallerCodeline = require('./utils/get-caller-codeline').bind(null, 3, 6);
var error = require('./utils/error');
var purry_error = require('./purry-error');
var syntax = require('./syntax');



function too_many_pins(args){
  var codeline = getCallerCodeline();
  // TODO get ident ___ string from syntax file.
  var probPointer = colPointer(lastIndexOf('___'), codeline);
  return error.syntax(
    'Purry: Only 1 pin allowed per invocation.\n'+
    '\n'+
    '    Remove %d pin(s):\n'+
    '\n'+
    '    %s\n'+
    '    %s\n',
    countPins(args) - 1,
    codeline,
    probPointer
  );
}


function too_many_args(f, args, params){
  var param_idents = funargs(f).filter(function(x, i){ return params[i] === '_'; });
  return error(
    'Purry: Arguments outnumber parameters.\n'+
    '\n'+
    '    Remove %d arg(s):\n'+
    '\n'+
    '    Params: %s\n'+
    '    Args  : %s\n'+
    '\n'+
    '%s\n'+
    '\n',
    args.length - param_idents.length,
    param_idents.join(', '),
    to_array(args).join(', '),
    getCallerCodeline()
  );
}



function incomplete_holes(args, params_size){
  return error.syntax(
    'Purry: Holes used but too few arguments given '+
    '(expected %d but got %d %s). '+
    'Argue all parameters or use a pin.',
    params_size,
    args.length,
    inspect(to_array(args), {depth:0})
  );
}



// Domain Helpers

// function format_params(params){
//   var na_msg = params.length ?
//       format('N/A (function is primed with %d arguments)', params.length) :
//       format('N/A (function is vargs or maybe not take any arguments?') ;
//   return only_holes(params).join(', ') || na_msg;
// }

// function only_holes(params){
//   return params.filter(function(x){ return x === syntax.tokens._; });
// }

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





exports.too_many_pins = purry_error(too_many_pins);
exports.too_many_args = purry_error(too_many_args);
exports.incomplete_holes = purry_error(incomplete_holes);
exports.no_vargs_support = function(){
  return error('Sorry, Purry does not currently support variable parameter functions.');
};