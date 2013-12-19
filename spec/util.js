var purry = require('../');
var assert = require('assert');
var lo = require('lodash')
var map = lo.map,
    range = lo.range;

exports.create_vparam_echo = function(size){
  var f = purry(function(){
    return Array.prototype.slice.apply(arguments);
  });
  f.check = exports.create_checker(size);
  return f;
};

exports.create_fixed_echo = function(size){
  var f = exports.create_echo(size);
  f.check = exports.create_checker(size);
  return f;
};

exports.create_checker = function(size){
  return function(actual){
    assert.deepEqual(range(1, size + 1), actual);
  };
};

exports.create_echo = function(size){
  var params = map(range(0, size), function(int){ return String.fromCharCode(int+97); });
  return purry(new Function(params.join(','), 'return Array.prototype.slice.apply(arguments);'));
};
