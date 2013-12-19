var purry = require('../');
var util = require('./util');
var lo = require('lodash');
var range = lo.range,
    random = lo.random,
    difference = lo.difference,
    map = lo.map,
    unique = lo.unique,
    contains = lo.contains,
    compose = lo.compose,
    sortBy = lo.sortBy,
    reduce = lo.reduce;

/*
Create a list of arguments that we will fuzzily apply. We want to automatically apply the arguments to the purried echo function such that the arguments are returned in the same order as this list.

The tricky affair is that we want to have the arguments supplied to echo using purry features randomly, yet not so random that we are not giving the arguments in the right order. Its important that we write correct fuzzy logic so that we don't mistake fuzzy-testing bugs with purry bugs!
*/

var pool = range(1, 5);
var f = util.create_fixed_echo(pool.length);


f.check(argue({pool:pool, f:f}).f);



// Library

function argue(group){
  console.log('argue group', group);
  return group.pool.length ? argue(holey_strategy(group)) : group ;
}

function holey_strategy(group){
  var indexes = gen_indexes(group.pool);
  // console.log('indexes %j', indexes);
  var args = reduce(group.pool, do_reduce, []);
  var pool_after = difference(group.pool, args);
  console.log('args: %j | pool_after: %j', args, pool_after);
  return {
    f: group.f.apply(null, args),
    pool: pool_after,
  };
  function do_reduce(acc, x, i){
    acc.push(contains(indexes, i) ? group.pool[i] : _);
    return acc;
  }
}

// Generate random gen_indexes to select from the pool
function gen_indexes(pool){
  return compose(
    sortBy,
    unique
  )(  reduce(range(0, rani(pool)), function(acc){
        acc.push(rani(pool)); return acc;
      }, [])
  );
}

function rani(pool){
  return random(0, pool.length);
}
