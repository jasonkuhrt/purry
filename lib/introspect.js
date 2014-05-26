'use strict';

var syntax = require('./syntax');
var fparams = require('args-list');
var lu = require('./utils/prelude'),
    to_array = lu.to_array;



exports.get_free_params = get_free_params;
exports.count_pins = count_pins;
exports.format_argument = format_argument;
exports.format_arguments = format_arguments;
exports.format_invocation = format_invocation;



function get_free_params(base_f, fparams_now){
  return fparams(base_f).filter(function(x, i){
    return fparams_now[i] === syntax.hole.val;
  });
}

function count_pins(args){
  return to_array(args).filter(function(x){
    return x === syntax.pin.val;
  }).length;
}

function format_argument(arg){
  return arg === syntax.pin.val ? syntax.pin.ident_custom || syntax.pin.ident :
         arg === syntax.hole.val ? syntax.hole.ident_custom || syntax.hole.ident :
         arg ;
}

function format_arguments(args){
  return to_array(args).map(format_argument).join(', ');
}

function format_invocation(args){
  return '('+ format_arguments(args) +')';
}