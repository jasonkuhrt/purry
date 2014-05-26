'use strict';

var format = require('util').format;
var inspct = require('../../lib/introspect');
var last = require('../../lib/utils/prelude').last;



module.exports = create_report;

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


// Private

function format_result(iters){
  var returned = last(iters).to.f_returned;
  return typeof returned === 'function' ? 'function' : format_array(returned.map(inspct.format_argument)) ;
}

function invo_sum(iters){
  var f_args_hist = iters.from.f_args;
  return f_args_hist.map(inspct.format_invocation).join('');
}

function format_array(array){
  return format('[%s]', array.join(', '));
}