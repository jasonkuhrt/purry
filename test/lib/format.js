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
    isEqual = lo.isEqual,
    map = lo.map,
    filter = lo.filter,
    toArray = lo.toArray,
    isFunction = lo.isFunction;


function is_pass(test){
  return isEqual(test.result, first(test.history).pool);
}

function format_test_history(test){
  var is_vparams = false;//first(test).is_vparams;
  var start = format('\n%s\n', is_vparams ? ints_to_def(1, []) : ints_to_def(1, first(test.history).pool));
  var middle = map(test.history, function(iter, i){
    var pool_s = color.brightBlack(format('\nArg Pool      %s', format_pool(iter.pool)));
    var args_s = color.brightBlack(format('Invoke %d      %s', i, format_invocation(iter.args)));
    var purry_params = iter.debug[i] ? iter.debug[i].params : null ;
    var purry_args = iter.debug[i] ? iter.debug[i].args : null ;
    return format('%s\n%s\nPurry Debug:\nGiven args    %j\nResult params %j', pool_s, args_s, purry_args, purry_params);
  }).join('\n\n');
  var end = format('\n\nreturn       %s', color[is_pass(test) ? 'green' : 'red'](format_result(test)));
  return start + middle + end;
}

function int_to_param(int){
  return String.fromCharCode(96+int);
}

function ints_to_def(i, ints){
  var a = color.brightBlack('      function(');
  var b = color.brightBlack(') {...}');
  return format('%s%s%s', a, color.blue(map(ints, int_to_param).join(', ')), b);
}

function format_pool(pool){
  return color.brightBlue(format_array(pool));
}

function format_result(fuzz){
  return isFunction(fuzz.result) ? 'function' : format_array(map(fuzz.result, format_argument)) ;
}

function invocation_summary(history){
  return map(pluck(history, 'args'), format_invocation).join('');
}

function create_report(test){
  var report = '';
  report += format('\n\n%s: %s', (is_pass(test) ? '      OK' : ' FAILURE'), invocation_summary(test.history));
  report += format('\nExpected: %s', format_array(first(test.history).pool));
  report += format('\n  Actual: %s', format_result(test));
  report += format('\n%s', format_test_history(test));
  return report;
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
exports.arg_test = format_test_history;
exports.create_report = create_report;
exports.argument = format_argument;
exports.arguments = format_arguments;
exports.invocation = format_invocation;