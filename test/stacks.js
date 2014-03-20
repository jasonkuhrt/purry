/* globals _, ___ */
'use strict';

var purry = require('../').install();
var assert = require('assert');


var padd = purry(add);
var add1 = padd(1);

// add1(2, ___, 'foo', ___);
doit(add1)(2, ___, 'foo', ___);
// doit(add1)(___, module, 45, 45, 45);
// add1(___, module, 45, 45, 45);

// add1(_); // TODO this doesn't throw???
// padd(_);

function doit(f){
  return function(){
    f.apply(null, arguments);
  };
}

// add1(___, module, ___, ___);
// add1('1');


function add(num1, num2){
  assert(typeof num1 === 'number');
  assert(typeof num2 === 'number');
  return num1 + num2;
}