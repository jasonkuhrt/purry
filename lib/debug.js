'use strict';
var to_array = require('./utils/prelude').to_array;
var format_invocation = require('../test/lib/format').invocation;
var format_stock = require('../test/lib/format').stock;
var format_arguments = require('../test/lib/format').arguments;
var format_argument = require('../test/lib/format').argument;


exports.log = function(){
  console.log.apply(console, arguments);
};

exports.bar = function(){
  console.log('===================================================================================================');
};

exports.start = function(args){
  console.log('\nSTART %s', format_invocation(args));
};

exports.end = function(is_delayed_execution, size){
  console.log('END is_delayed_execution %j  |  size %d', is_delayed_execution, size);
};

exports.early_exit_no_real_args = function(args){
  console.log('EXT EARLY < No real args < %s', format_arguments(args));
};

exports.early_exit_no_args = function(args){
  console.log('EXT EARLY < No args < %s', format_arguments(args));
};

exports.state_vargs = function(){
  var format = ['l_stock: %j', 'l_hole_count: %j', 'l_min: %d', 'r_stock: %j', 'r_hole_count: %j', 'r_min: %d'].join('  |  ');
  var log_args = [format].concat(to_array.apply(arguments));
  console.log.apply(console, log_args);
};

exports.state = function(params, psize, phead, ptail, pii){
  console.log('%s', format_stock(params, phead, ptail, params.length - psize, pii));
};

exports.loop = function(i, end, arg){
  console.log('---------------------------------------------------------------------------------------------------');
  console.log('LOOP %d/%d: %s', i, end - 1, format_argument(arg));
};

exports.loop_state = function(){
  var format = '      stocked_args_size: %d  |  params: %j  |  mark_head: %d  |  mark_tail: %d';
  arguments[1] = format_stock(arguments[1]);
  console.log.apply(null, [format].concat(to_array(arguments)));
};

exports.loop_match_arg_to_old_hole = function(arg, stock_i){
  console.log('      Match instance arg (%d) to already-seen hole (index %d)', arg, stock_i);
};

exports.loop_match_hole_to_old_hole = function(stock_i){
  console.log('      Match instance hole to already-seen stock hole (index %d)', stock_i);
};

exports.loop_match_hole_to_new_param = function(stock_i){
  console.log('      Match instance hole to never-seen stock param (index %d)', stock_i);
};

exports.loop_state_vargs = function(){
  var format = ['min_i: %d', 'stock_i: %d', 'stock_i_limit: %d', 'hole_count: %j', 'stock: %j'].join('  |  ');
  var log_args = [format].concat(to_array.apply(arguments));
  console.log.apply(console, log_args);
};