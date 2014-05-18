'use strict';

var pe = require('./lib/utils/prelude'),
    array_of = pe.array_of;
var errors = require('./lib/errors');
var algo_fixed = require('./lib/algo-fixed');
var syntax = require('./lib/syntax');



module.exports = purry;

function purry(f){
  var psize = f.length;
  if (psize) {
    return algo_fixed(f, array_of(psize, syntax.hole.val), psize, 0, psize-1);
  } else {
    throw errors.no_vargs_support();
  }
}

purry.install = require('./lib/install')(purry);