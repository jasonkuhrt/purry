/*global create_fixed_echo, eq */
'use strict';

var glo = typeof GLOBAL === 'undefined' ? window : GLOBAL ;

try {
  glo['purry'] = require('../../index').install();
} catch (err) {
  glo.purry = require('purry').install();
}

glo.eq = function eq(a, b, c){
  a.should.eql(b, c);
};

glo.echo6 = create_fixed_echo(6);

glo.throws = function throws(f, code){
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


glo.throws_not = function throws_not(f){
  var threw = false;
  try {
    f();
  } catch (err) {
    threw = true;
  } finally {
    eq(threw, false);
  }
};