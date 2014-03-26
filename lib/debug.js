'use strict';

var last = require('./utils/prelude').last;
var format_invocation = require('../test/lib/format').invocation;
var format_stock = require('../test/lib/format').stock;
var format_argument = require('../test/lib/format').argument;
function noop(){}



exports.enabled = Boolean(process.env.PURRY_DEBUG);

exports.history = function(f, args){
  if (!f.purry_history) f.purry_history = [];
  f.purry_history.push({
    args: args,
    resolve: []
  });
};

exports.history_r = function(f, p, psize, phead, ptail, ii){
  var hist = last(f.purry_history);
  hist.resolve.push({
    params: p,
    psize: psize,
    phead: phead,
    ptail: ptail,
    ii: ii
  });
};

exports.start = function(f){
  var iter = last(f.purry_history);
  bar();
  console.log('\nSTART. Arguments: %s', format_invocation(iter.args));
  state(last(iter.resolve));
};

exports.loop = function(f, i, end, arg){
  var iterres = last(last(f.purry_history).resolve);
  bar_small();
  console.log('LOOP %d/%d: %s', i, end - 1, format_argument(arg));
  state(iterres);
};

exports.end = function(f){
  var iterres = last(last(f.purry_history).resolve);
  bar_small();
  console.log('END');
  state(iterres);
  bar();
};

function state(s){
  console.log('%s', format_stock(s.params, s.phead, s.ptail, s.params.length - s.psize, s.ii));
}

function bar(){
  console.log('===================================================================================================');
}

 function bar_small(){
  console.log('---------------------------------------------------------------------------------------------------\n');
}



if (!exports.enabled) {
  exports.history = noop;
  exports.history_r = noop;
  exports.start = noop;
  exports.loop = noop;
  exports.end = noop;
}