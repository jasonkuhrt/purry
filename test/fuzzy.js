var format = require('./lib/format');
var log = require('debug')('fuz');
var debug = require('../lib/debug');
var purry = require('../');
var gen_instance = require('./lib/generate-args');
var util = require('./lib/util'),
    gen_bool = util.gen_bool,
    gen_ints = util.gen_ints,
    amass = util.amass;
var lo = require('lodash'),
    range = lo.range,
    first = lo.first,
    last = lo.last,
    random = lo.random,
    isEqual = lo.isEqual,
    isFunction = lo.isFunction,
    isEmpty = lo.isEmpty,
    difference = lo.difference,
    size = lo.size,
    each = lo.each,
    map = lo.map,
    filter = lo.filter,
    without = lo.without,
    times = lo.times,
    contains = lo.contains;



/*
Create a list of arguments that we will fuzzily apply. We want to automatically apply the arguments to the purried echo function such that the arguments are returned in the same order as this list.

The tricky affair is that we want to have the arguments supplied to echo using purry features randomly, yet not so random that we are not giving the arguments in the right order. Its important that we write correct fuzzy logic so that we don't mistake fuzzy-testing bugs with purry bugs!
*/


// Prepare the test settings

var show = Number(process.argv[3]) || 0;
var count = Number(process.argv[2]) || 100;
console.log('\nFuzzy Test settings: display_report_mode %d | times %d', show, count);



// Do the tests

var reports = [];


console.log('Fuzzy results: %d passed and %d failed', size((reports, 'is_pass')), size(lo.reject(reports, 'is_pass')));




// Private Library

function make_and_run_test(){
  return report_fuzz(test_resolve(create_test()));
  function create_test(){
    return [create_iteration()];
    function create_iteration(){
      var pool = gen_ints(1, 8);
      var is_vparams = false; //gen_bool();
      var f = util.create_echo(is_vparams, size(pool));
      var args = gen_instance(pool);
      return Model(is_vparams, f, pool, args);
    }
  }
}


function Model(is_vparams, f, pool, args){
  return {
    f: f,
    is_vparams: is_vparams,
    pool: pool,
    args: args
  };
}


// f, [a] -> [a]
function test_resolve(test){
  var next = test_step(test);
  test.concat(next)
  // If iter is resolved return test
  return is_iter_resolved(next) ? test : test_resolve(test) ;
}


function test_step(test){
  var iter = last(test);
  var _f, _pool, _args, origin;
  if (iter.is_vparams) {
    _f = iter.f.apply(null, iter.args);
    _pool = difference(iter.pool, iter.args);
    _args = gen_instance.vparam(iter.pool, first(test).pool);
    _args = guard_invocation(iter, _args);
  } else {
    _f = iter.f.apply(null, iter.args);
    _pool = difference(iter.pool, iter.args);
    _args = gen_instance(iter.pool);
  }
  return Model(iter.is_vparams, _f, _pool, _args);
  // vparam functions don't support currying so invoke at the first chance (no delay syntax).
  // This function will add a left-pin to args
  // if all the params have not been argued yet (and the args are not already dealyed).
  function guard_invocation(fuzz, args){
    return !isEmpty(last(fuzz.pool)) && !args_contains_delay(args) ? gen_instance.lpin(args) : args ;
  }
}


function report_fuzz(test){
  var is_pass = isEqual(last(test).f, first(test).pool);
  return {
    is_pass: is_pass,
    string: format.create_report(is_pass, test)
  };
}


function display_report(display_mode){
  return function(report){
    if (display_mode === 3 || Boolean(display_mode) === report.is_pass) console.log(report.string)
  }
}


// Fuzz -> Bool
// Either the function is exhausted
// or the pool is exhausted AND the last arg set had no delay.
function is_iter_resolved(iter){
  return !isFunction(iter.f) || (isEmpty(iter.pool) && !args_contains_delay(iter.args));
}


// [a] -> Bool
function args_contains_delay(args){
  return size(difference([_, ___], args)) < 2;
}