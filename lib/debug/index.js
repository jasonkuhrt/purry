'use strict';

var is_server = require('plat').isServer;
var last = require('../utils/prelude').last;
var formatp = require('./format'),
    format_invocation = formatp.invocation,
    format_stock = formatp.stock,
    format_argument = formatp.argument;
function noop(){}



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
  log('\nSTART. Arguments: %s', format_invocation(iter.args));
  state(last(iter.resolve));
}



loop = loop;

function loop(f, i, end, arg){
  var iterres = last(last(f.purry_history).resolve);
  bar_small();
  log('LOOP %d/%d: %s', i, end - 1, format_argument(arg));
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



if (!exports.enabled && !exports.history_enabled) {
  exports.history = noop;
  exports.history_record = noop;
  exports.start = noop;
  exports.loop = noop;
  exports.end = noop;
}