'use strict';

function noop(){}
var is_server = require('plat').isServer;
var format = is_server ? require('util').format : noop ;
var inspct = require('./introspect');
var tt = require('./utils/terminal-text');
var last = require('./utils/prelude').last;



exports.enabled = is_server ? Boolean(process.env.PURRY_DEBUG) :  false;
exports.history_enabled = exports.enabled || (is_server ? Boolean(process.env.PURRY_HISTORY) : false );

var log = exports.enabled ? console.log : noop ;

exports.history = function history(f, args){
  f.purry_history = f.purry_history ? f.purry_history.slice(0) : [] ;
  f.purry_history.push({
    args: args,
    resolve: []
  });
};



exports.history_record = history_record;

function history_record(f, p, psize, phead, ptail, ii){
  var hist = last(f.purry_history);
  hist.resolve.push({
    params: p,
    psize: psize,
    phead: phead,
    ptail: ptail,
    ii: ii
  });
}



exports.start = start;

function start(f){
  var iter = last(f.purry_history);
  bar();
  log('\nSTART. Arguments: %s', inspct.format_invocation(iter.args));
  state(last(iter.resolve));
}



loop = loop;

function loop(f, i, end, arg){
  var iterres = last(last(f.purry_history).resolve);
  bar_small();
  log('LOOP %d/%d: %s', i, end - 1, inspct.format_argument(arg));
  state(iterres);
}



exports.end = end;

function end(old_f, returns){
  if (returns) returns.purry_history = old_f.purry_history;
  var iterres = last(last(old_f.purry_history).resolve);
  bar_small();
  log('END');
  state(iterres);
  bar();
}



if (!exports.enabled && !exports.history_enabled) {
  exports.history = noop;
  exports.history_record = noop;
  exports.start = noop;
  exports.loop = noop;
  exports.end = noop;
}



// Private

function state(s){
  log('%s', format_stock(s.params, s.phead, s.ptail, s.params.length - s.psize, s.ii));
}

function bar(){
  log('===================================================================================================');
}

function bar_small(){
  log('---------------------------------------------------------------------------------------------------\n');
}

function format_stock(stock, head, tail, args_count, instance_mark){
  var stock_s = inspct.format_arguments(stock);
  var argued_stat_s = format('%d/%d', args_count, stock.length);
  var mark_symbols = format('%s>%s<', tt.space(head * 3), tt.space((tail - head) * 3 - 1));
  var mark_indexes = format('%s%d%s%d', tt.space(head * 3), head, tt.space((tail - head) * 3 - 1), tail);
  var ins_mark_s = format('%s^%d', tt.space(instance_mark * 3), instance_mark);
  return format('\n%s   (%s)\n%s\n%s\n%s\n', stock_s, argued_stat_s, mark_symbols, mark_indexes, ins_mark_s);
}