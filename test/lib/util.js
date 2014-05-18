/* global _*/
'use strict';

var purry = require('../../');
var assert = require('assert');
var lo = require('lodash'),
    clone = lo.clone,
    contains = lo.contains,
    times = lo.times,
    map = lo.map,
    range = lo.range,
    random = lo.random,
    each = lo.each,
    partial = lo.partial,
    id = lo.identity;



exports.create_echo = function(is_vparams, size){
  return is_vparams ? exports.create_vparam_echo(size) : exports.create_fixed_echo(size) ;
};

exports.create_vparam_echo = function(size){
  var f = purry(function(){
    return Array.prototype.slice.apply(arguments);
  });
  f.check = exports.create_checker(size);
  return f;
};

exports.create_fixed_echo = function(size){
  var f = purry(exports.do_create_fixed_echo(size));
  f.check = exports.create_checker(size);
  return f;
};

exports.do_create_fixed_echo = function do_create_fixed_echo(size){
  var params = map(range(1, size + 1), function(int){ return String.fromCharCode(int+97); });
  return new Function(params.join(','), 'return Array.prototype.slice.apply(arguments);');
}

exports.create_checker = function(size){
  return function(actual){
    assert.deepEqual(range(0, size), actual);
  };
};


// Helpers
exports.gen_holes = function(){
  return exports.amass(partial(id, _), (exports.gen_bool() && exports.gen_bool() ? random(0, 4) : 0 ));
};

exports.without_indexes = function(blacklist, array){
  var array_ = [];
  each(array, function(item, i){
    if (!contains(blacklist, i)) array_.push(item);
  });
  return array_;
};

// [a] -> [int]
exports.random_indexes = function(array){
  return random_n_picks(random(0, array.length), array);
};

// int, [a] -> [int]
function random_n_picks(how_many, array){
  return select_random(how_many, range(0, array.length));
}

// int, [b] -> [b]
function select_random(how_many, array){
  if (how_many > array.length) throw new Error('Asked to select too many from array.');
  var pool = clone(array);
  var picks = [];
  for (var i = 0; i < how_many; i++) {
    picks.push(pool.splice(random(0, pool.length - 1), 1)[0]);
  }
  // log('select_random: how_many %d | pool %j | picks %j', how_many, pool, picks);
  return picks;
}

// -> Bool
exports.gen_bool = function(){
  return Boolean(random(0, 1));
};

// int, int -> [int]
exports.gen_ints = function(start, up_to){
  return range(start, random(start, up_to) + 1);
};

// (-> a), int -> [a]
exports.amass = function(f, times_count){
  var amassed = [];
  times(times_count, function(){
    amassed.push(f());
  });
  return amassed;
};

exports.random_bisect = function(array){
  return bisect_at(random_index(array), array);
};

// int, [a] -> [[a][a]]
function bisect_at(i, array){
  return [array.slice(0, i), array.slice(i)];
}

// [a] -> int
function random_index(array){
  return random(0, array.length);
}