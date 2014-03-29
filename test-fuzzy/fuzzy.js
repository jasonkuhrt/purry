/* global _, ___ */
'use strict';

var is = require('assert');
var lu = require('../lib/utils/prelude');
var format = require('../test/lib/format');
var color = require('ansicolors');
// var u = require('util');
// var log = require('debug')('fuzzy');
var purry = require('../').install();
var gen_instance = require('./lib/generate-args');
var util = require('../test/lib/util'),
    gen_ints = util.gen_ints;
var lo = require('lodash'),
    first = lo.first,
    last = lo.last,
    isEqual = lo.isEqual,
    isFunction = lo.isFunction,
    isEmpty = lo.isEmpty,
    difference = lo.difference,
    size = lo.size,
    times = lo.times;






// Prepare the test settings.

var argv_conf = {
  default: {
    report: 1,
    count: 1000

  }
};

var conf = require('minimist')(process.argv.slice(2), argv_conf);
var passes = 0;

// Do the test.

console.log('\nFuzzy Test settings: report %d | count %d', conf.report, conf.count);
times(conf.count, challenge);
console.log('\nFuzzy Test results: %s passed and %s failed', color.green(passes), color.red(conf.count - passes));

function should_report(is_pass){
  return  (conf.report === 2) ||
          (conf.report === 0 && is_pass) ||
          (conf.report === 1 && !is_pass);
}







// Private Library

function challenge(){
  var iters = resolve(seed_test(), []);
  // console.log(u.inspect(iters, { depth:Infinity }));
  var is_pass = validate_final_result(iters);
  var report = format.create_report(is_pass, iters);
  if (should_report(is_pass)) console.log(report);
  passes++;
}

function resolve(iter_seed, iters){
  var iters_ = iters.concat([do_iter(iter_seed)]);
  return is_iter_final(last(iters_)) ? iters_ : resolve(seed_iter(last(iters_)), iters_) ;
}

function seed_iter(iter){
  return Iter(iter.to.f_returned,
    iter.to.params,
    iter.to.pool,
    gen_instance(iter.to.pool));
}

function validate_final_result(iters){
  var ex = first(iters).from.pool;
  var ac = last(iters).to.f_returned;
  // log('validate_final_result? %j %j', ex, ac);
  return isEqual(ac, ex);
}

/*
seed_test :: -> Test
*/
function seed_test(){
  var pool = gen_ints(0, 5);
  var args = gen_instance(pool);
  var params = lu.array_of(size(pool), _);
  var f = util.create_fixed_echo(size(pool));
  var test = Iter(f, params, pool, args);
  // log('seed_test %j', test);
  return test;
}

function do_iter(iter){
  iter.to.f_returned = iter.from.f.apply(null, iter.from.f_args);
  iter.to.f_iterated = last(lo.cloneDeep(iter.to.f_returned.purry_history));
  delete iter.to.f_returned.purry_history;
  validate_iter(iter);
  return iter;
}

function validate_iter(iter){
  validate_from_params(iter);
  validate_to_params(iter);
  validate_args(iter);
  return iter;
}

function validate_args(iter){
  var ex = iter.from.f_args;
  var ac = iter.to.f_iterated.args;
  is.deepEqual(ex, ac);
}

function validate_from_params(iter){
  var ex = iter.from.params;
  var ac = first(iter.to.f_iterated.resolve).params;
  is.deepEqual(ex, ac);
}

function validate_to_params(iter){
  var ex = iter.to.params;
  var ac = last(iter.to.f_iterated.resolve).params;
  is.deepEqual(ex, ac);
}



/*

*/
function Iter(f, params, pool, gend){
  return {
    from: {
      params: params,
      pool: pool,
      f_args: gend.args,
      f: f
    },
    to: {
      params: update_params(params, pool, gend.picks),
      pool: gend.new_pool
    }

  };
}

function update_params(params, pool, indexes){
  var params_ = lo.cloneDeep(params);
  lo.each(indexes, function(ind){
    params_[pool[ind]] = pool[ind];
  });
  return params_;
}


/*
is_iter_resolved :: Iter a -> Bool b

Either f is exhausted
or the pool is exhausted AND the last args isn't delayed.

*/
function is_iter_final(iter){
  // log('is_iter_resolved? %j', (is_f_exhaused(iter) || is_pool_exhausted(iter)));
  return is_f_exhaused(iter) || is_pool_exhausted(iter);
}


/*
is_pool_exhausted :: Iter a -> Bool b
*/
function is_pool_exhausted(iter){
  return (isEmpty(iter.to.pool) && !args_contains_delay(iter.from.f_args));
}


/*
is_f_exhaused :: Iter a -> Bool b
*/
function is_f_exhaused(iter){
  return !isFunction(iter.to.f_returned);
}


/*
args_contains_delay :: [a] -> Bool

*/
function args_contains_delay(args){
  return size(difference([_, ___], args)) < 2;
}