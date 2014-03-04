'use strict';
/* globals _, ___ */

var purry = require('../').install();
var assert = require('assert');


var padd = purry(add);
var add1 = padd(1);

// add1(2, ___, 'foo', ___);
add1(___, module, ___, ___);
// add1('1');


function add(a, b){
  assert(typeof a === 'number');
  assert(typeof b === 'number');
  return a + b;
}