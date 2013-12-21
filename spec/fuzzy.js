var debug = require('../lib/debug');
var purry = require('../');
var util = require('./util');
var lo = require('lodash');
var range = lo.range,
    random = lo.random,
    difference = lo.difference,
    clone = lo.clone,
    size = lo.size,
    map = lo.map,
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

times(Number(process.argv[2]) || 100, function(){
  var is_vargs = random_bool();
  var pool = range(1, random(2,8));
  fuzzy_test(is_vargs, pool);
});



// Library

function fuzzy_test(is_vargs, pool){
  var done = argue(create_group(is_vargs, pool));
  // console.log('DONE %j', done);
  var is_ok = lo.isEqual(done.f, pool);
  if (!is_ok) log_report(is_ok, pool, done);

  function log_report(is_ok, pool, group){
    console.log('\n\n')
    console.log(' %s:', is_ok ? 'SUCCESS' : 'FAILURE');
    console.error('  vargs?: %j', group.is_vargs);
    console.error('Expected: %j', pool);
    console.error('  Actual: ', group.f);
    console.error('   Trace: %s', format_history(group.history));
  }
}

function format_history(history){
  return map(history, debug.format_arguments).join('');
}

function create_group(is_vargs, pool){
  var group = {
    f: (util[(is_vargs ? 'create_vparam_echo' : 'create_fixed_echo')](pool.length)),
    is_vargs: is_vargs,
    pool: pool,
    history: []
  };
  // console.log('create_group:', group);
  return group;

}

function argue(group){
  // console.log('\nLOOP\ngroup: %j', group);
  return group.pool.length ? argue(instance(group, strategy_holes(group.pool))) : finish(group) ;
}

function finish(group){
  // console.log('\nfinish %j', group);
  return contains_partial(last(group.history)) ? instance(group, []) : group ;
}

function instance(group, args){
  if (group.pool.length) args = support_vargs(group, args);
  var group_ = {
    f: group.f.apply(null, args),
    pool: difference(group.pool, args),
    is_vargs: group.is_vargs,
    history: group.history.concat([args])
  };
  // console.log('\ninstance: %j', group_);
  return group_;
}

function contains_partial(args){
  return size(difference([_, ___], args)) < 2;
}

function support_vargs(group, args){
  return group.is_vargs && !contains_partial(args) ? args.concat([___]) : args ;
}

function strategy_holes(pool){
  // // console.log('\nSTRATEGY holes\nargs: %j | pool_after: %j', args, pool_after);
  var indexes = random_indexes(random(0, pool.length), pool);
  return map(indexes, function(x,i){
    return contains(indexes, i) ? pool[i] : _ ;
  });l
}

function random_indexes(how_many, array){
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
  // // // console.log('how_many', how_many, pool, picks);
  return picks;
}

function random_index(array){
  return random(0, array.length);
}

function random_bool(){
  return Boolean(random(0, 2));
}