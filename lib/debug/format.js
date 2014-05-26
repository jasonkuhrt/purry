'use strict';
var format = function(){};
var tt = require('../utils/terminal-text');
var inspct = require('../introspect');
var last = require('../utils/prelude').last;



exports.stock = format_stock;
exports.create_report = create_report;



function format_result(iters){
  var returned = last(iters).to.f_returned;
  return typeof returned === 'function' ? 'function' : format_array(returned.map(inspct.format_argument)) ;
}

function invo_sum(iters){
  var f_args_hist = iters.from.f_args;
  return f_args_hist.map(inspct.format_invocation).join('');
}

function create_report(is_pass, iters){
  return format('\n\n'+
  '       %s  %s\n'+
  'Expected: %s\n'+
  '  Actual: %s',
  (is_pass ? '✔' : '×'),
  invo_sum(iters),
  format_array(iters[0].from.pool),
  format_result(iters),
  '');
}



function format_stock(stock, head, tail, args_count, instance_mark){
  var stock_s = inspct.format_arguments(stock);
  var argued_stat_s = format('%d/%d', args_count, stock.length);
  var mark_symbols = format('%s>%s<', tt.space(head * 3), tt.space((tail - head) * 3 - 1));
  var mark_indexes = format('%s%d%s%d', tt.space(head * 3), head, tt.space((tail - head) * 3 - 1), tail);
  var ins_mark_s = format('%s^%d', tt.space(instance_mark * 3), instance_mark);
  return format('\n%s   (%s)\n%s\n%s\n%s\n', stock_s, argued_stat_s, mark_symbols, mark_indexes, ins_mark_s);
}

function format_array(array){
  return format('[%s]', array.join(', '));
}