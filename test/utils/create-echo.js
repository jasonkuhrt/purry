/* global purry, eq */

var glo = typeof GLOBAL === 'undefined' ? window : GLOBAL ;
var lo = require('lodash'),
    map = lo.map,
    range = lo.range;


function create_fixed_echo(size){
  var f = purry(do_create_fixed_echo(size));
  f.check = create_checker(size);
  return f;
}

glo.create_fixed_echo = create_fixed_echo;

function do_create_fixed_echo(size){
  var params = map(range(1, size + 1), function(int){ return String.fromCharCode(int+97); });
  return new Function(params.join(','), 'return Array.prototype.slice.apply(arguments);');
}
glo.do_create_fixed_echo = do_create_fixed_echo;

function create_checker(size){
  return function(actual){
    eq(range(0, size), actual);
  };
}
