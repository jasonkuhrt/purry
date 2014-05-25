/*global create_fixed_echo, eq */
'use strict';

var globe = typeof GLOBAL === 'undefined' ? window : GLOBAL ;

try {
  globe['purry'] = require('../../index').install();
} catch (err) {
  globe.purry = require('purry').install();
}

globe.eq = function eq(a, b, c){
  a.should.eql(b, c);
};

globe.echo6 = create_fixed_echo(6);

globe.throws = function throws(f, code){
  var threw = false;
  try {
    f();
  } catch (err) {
    threw = true;
    if (code) eq(err.code, code);
  } finally {
    eq(threw, true);
  }
};


globe.throws_not = function throws_not(f){
  var threw = false;
  try {
    f();
  } catch (err) {
    threw = true;
  } finally {
    eq(threw, false);
  }
};