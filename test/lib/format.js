'use strict';
var format = require('util').format;
var color = require('ansicolors');
var syntax = require('../../lib/syntax');
var lu = require('../../lib/utils/prelude'),
    space = lu.space,
    rev_lookup_or_pass = lu.rev_lookup_or_pass;
var lo = require('lodash'),
    first = lo.first,
    pluck = lo.pluck,
    map = lo.map,
    last = lo.last,
    toArray = lo.toArray,
    isFunction = lo.isFunction;




function format_result(iters){
  var returned = last(iters).to.f_returned;
  return isFunction(returned) ? 'function' : format_array(map(returned, format_argument)) ;
}

function invo_sum(iters){
  var f_args_hist = pluck(pluck(iters, 'from'), 'f_args');
  return map(f_args_hist, format_invocation).join('');
}

function create_report(is_pass, iters){
  return format('\n\n'+
  '       %s  %s\n'+
  'Expected: %s\n'+
  '  Actual: %s',
  (is_pass ? color.green('✔') : color.red('×')),
  invo_sum(iters),
  format_array(first(iters).from.pool),
  format_result(iters),
  '');
}

function format_argument(arg){
  return rev_lookup_or_pass(syntax.tokens, arg);
}

function format_arguments(args){
  return toArray(args).map(format_argument).join(', ');
}

function format_invocation(args){
  return color.brightBlue(format('(%s)', format_arguments(args)));
}

function format_stock(stock, head, tail, args_count, instance_mark){
  var stock_s = format_arguments(stock);
  var argued_stat_s = format('%d/%d', args_count, stock.length);
  var mark_symbols = format('%s>%s<', space(head * 3), space((tail - head) * 3 - 1));
  var mark_indexes = format('%s%d%s%d', space(head * 3), head, space((tail - head) * 3 - 1), tail);
  var ins_mark_s = format('%s^%d', space(instance_mark * 3), instance_mark);
  return format('\n%s   (%s)\n%s\n%s\n%s\n', stock_s, argued_stat_s, mark_symbols, mark_indexes, ins_mark_s);
}

function format_array(array){
  return format('[%s]', array.join(', '));
}



exports.stock = format_stock;
exports.create_report = create_report;
exports.argument = format_argument;
exports.arguments = format_arguments;
exports.invocation = format_invocation;