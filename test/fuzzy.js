var format = require('util').format;
var log = require('debug')('fuz');
var debug = require('../lib/debug');
var purry = require('../');
var util = require('./util');
var lo = require('lodash');
var range = lo.range,
    random = lo.random,
    difference = lo.difference,
    clone = lo.clone,
    size = lo.size,
    each = lo.each,
    map = lo.map,
    filter = lo.filter,
    without = lo.without,
    first = lo.first,
    last = lo.last,
    unique = lo.unique,
    times = lo.times,
    contains = lo.contains,
    compose = lo.compose,
    sortBy = lo.sortBy,
    reduce = lo.reduce;

/*
Create a list of arguments that we will fuzzily apply. We want to automatically apply the arguments to the purried echo function such that the arguments are returned in the same order as this list.

The tricky affair is that we want to have the arguments supplied to echo using purry features randomly, yet not so random that we are not giving the arguments in the right order. Its important that we write correct fuzzy logic so that we don't mistake fuzzy-testing bugs with purry bugs!
*/


// Prepare the test settings

var show = Number(process.argv[3]) || 0;
var count = Number(process.argv[2]) || 100;
console.log('\nFuzzy Test settings: display_report_mode %d | times %d', show, count);


// Do the tests

var reports = amass(create_fuzzy_test, count);

console.log('Fuzzy Test results (%d/%d):', filter(reports, function(report){ return report.is_pass; }).length, reports.length);

each(reports, display_report(show));


// Library

function display_report(display_mode){
  return function(report){
    if (display_mode === 3 || Boolean(display_mode) === report.is_pass) console.log(report.string)
  }
}

function create_fuzzy_test(){
  return compose(report_fuzz, resolve_fuzz, create_fuzz)();
}

function create_fuzz(){
  var pool = random_range_from(1, 12);
  var is_vargs = false;//random_bool();
  var f = util[(is_vargs ? 'create_vparam_echo' : 'create_fixed_echo')](pool.length);

  var fuzz = {
     f: f
    ,is_vargs: is_vargs
    ,pool: pool
    ,history: []
  };

  log('create fuzz', fuzz);

  return fuzz;
}

function report_fuzz(fuzz){
  log('DONE %j', fuzz);
  var is_pass = lo.isEqual(fuzz.f, fuzz.pool);

  return {
    is_pass: is_pass,
    string: create_report(is_pass, fuzz.pool, fuzz)
  };

  function create_report(is_pass, pool, group){
    var report = '';
    report += format('\n\n%s', is_pass ? 'SUCCESS' : 'FAILURE');
    report += format('\n  vargs?: %j', group.is_vargs);
    report += format('\nExpected: %j', pool);
    report += format('\n  Actual:', typeof group.f === 'function' ? 'function' : format_result(group.f));
    report += format('\n   Trace: %s', format_history(group.history));
    return report;
  }
}




// f, [a] -> [a]
function resolve_fuzz(fuzz){
  return fuzz.is_vargs ? resolve_fuzz_vargs(fuzz) : resolve_fuzz_args(fuzz) ;
}

function resolve_fuzz_args(fuzz){
  return finish(argue_fuzz(fuzz.f, fuzz.pool, fuzz.history));

  function finish(result){
    if (contains_partial(last(result.history))){
      result.f = result.f();
      result.history.push([]);
    }
    return result;
  }

  function argue_fuzz(f, pool, instance_history){
    if (typeof f !== 'function' && size(pool)) return {f:f, pool:fuzz.pool, is_vargs:fuzz.is_vargs, history:instance_history}
    log('argue_fuzz', pool, instance_history);
    var args = purry_instance(random(1, 4), pool);
    log('purry_instance args', debug.format_invocation(args));
    var f_ = f.apply(null, args);
    var pool_ = difference(pool, args);
    var instance_history_ = instance_history.concat([args]);
    log('argue_fuzz_ pool %j', pool_);
    return size(pool_) ? argue_fuzz(f_, pool_, instance_history_) : {f:f_, pool:fuzz.pool, is_vargs:fuzz.is_vargs, history:instance_history_} ;
  }
}

function resolve_fuzz_vargs(fuzz){

}

// @pin_side enum
// value meaning
// 1     left
// 2     right
// 3     split
// 4     none
function purry_instance(pin_side, pool){
  var indexes = sortBy(random_indexes(pool))
  log('purry_instance start: pin_side %d | pool %j | indexes %j', pin_side, pool, indexes);
  if (pin_side === 3) return pin_split(pool);
  var args = [];
  if (indexes.length) {
    var istart = pin_side !== 2 ? 0                 : first(indexes) ;
    var istop  = pin_side !== 2 ? last(indexes) + 1 : pool.length ;
    for(var i = istart; i < istop; i++){
      args.push(contains(indexes, i) ? pool[i] : _ );
    }
  }
  log('purry_instance args: %j', args);
  var args_ = add_pin(pin_side, args);
  log('purry_instance args (add_pin): %j', args_);
  log('purry_instance end: pin_side %d | pool %j | indexes %j', pin_side, pool, indexes);
  return args_;
}

function add_pin(pin_side, args){
  var pin = [];
  var trailing_holes = random_bool() ? 4 : 0 ;
  switch (pin_side) {
    case 1:
      pin = random_amount_of(0, trailing_holes, _).concat([___]);
      break;
    case 2:
      pin = [___].concat(random_amount_of(0, trailing_holes, _));
      break;
    case 4:
      pin = random_amount_of(0, trailing_holes, _);
  }
  var args_ = pin_side === 2 ? pin.concat(args) : args.concat(pin) ;
  return args_;
}

function pin_split(pool){
  var pools = random_bisect(pool);
  var left = purry_instance(1, pools[0]);
  // Remove leading ___ which will be supplied by left
  var right = without(purry_instance(2, pools[1]), ___);
  log('pin_split: pools %j | left %j | right %j', pools, left, right);
  return left.concat(right);
}

// Bool, [a] -> [b]
function random_amount_of(min, max, value){
  return reduce(random_range_from(min, max), function(acc){ return acc.concat(value); }, []);
}










function format_history(history){
  return map(history, debug.format_invocation).join('');
}

function format_result(array){
  return map(array, function(x){ return x === _ ? '_' : x === ___ ? '___' : x ; });
}


// [a] -> Bool
function contains_partial(args){
  return size(difference([_, ___], args)) < 2;
}

// [a] -> [int]
function random_indexes(array){
  return random_n_indexes(random(0, array.length), array);
}

// int, [a] -> [int]
function random_n_indexes(how_many, array){
  return select_random(how_many, range(0, array.length));
}

// int, [b] -> [b]
function select_random(how_many, array){
  if (how_many > array.length) throw new Error('Asked to select too many from array.');
  var pool = lo.clone(array);
  var picks = [];
  for (var i = 0; i < how_many; i++) {
    picks.push(pool.splice(random(0, pool.length - 1), 1)[0]);
  }
  log('select_random: how_many %d | pool %j | picks %j', how_many, pool, picks);
  return picks;
}

// [a] -> [[a][a]]
function random_bisect(array){
  return bisect_at(random_index(array), array);
}

// int, [a] -> [[a][a]]
function bisect_at(i, array){
  return [array.slice(0, i), array.slice(i)];
}

// [a] -> int
function random_index(array){
  return random(0, array.length);
}

// int, int -> [int]
function random_range_from(start, up_to){
  return range(start, random(start, up_to));
}

// -> Bool
function random_bool(){
  return Boolean(random(0, 2));
}

// (-> a), int -> [a]
function amass(f, times_count){
  var amassed = [];
  times(times_count, function(){
    amassed.push(f());
  });
  return amassed;
}