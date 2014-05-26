/*global create_fixed_echo, eq */
'use strict';

var is_client = typeof GLOBAL === 'undefined';
var globe = is_client ? window : GLOBAL ;

globe['purry'] = (is_client ? require('purry') : require('../../index')).install() ;

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