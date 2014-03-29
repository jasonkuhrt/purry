/* global _, ___*/
'use strict';

var util = require('../../test/lib/util'),
    random_bisect = util.random_bisect,
    gen_holes = util.gen_holes,
    random_indexes = util.random_indexes,
    gen_bool = util.gen_bool,
    without_indexes = util.without_indexes;
var lo = require('lodash'),
    defaults = lo.defaults,
    contains = lo.contains,
    map = lo.map,
    sortBy = lo.sortBy,
    range = lo.range,
    random = lo.random,
    size = lo.size,
    each = lo.each,
    min = lo.min,
    max = lo.max,
    curry = lo.curry;



module.exports = Gen_Instance;

// Default generators
var option_defaults = {
  dir: function(){
    return random(0,2);
  },
  is_strict_pin: function(){
    return gen_bool() && gen_bool();
  }
};

// Constructor
function Gen_Instance(args_pool, options_){
  var options = defaults(options_ || {}, option_defaults);
  // Generate flag for strict_pin. If strict_pin is off
  // it means leftward args (left partial application) will not have
  // a pin (because its not required in left case)
  var is_strict_pin = options.is_strict_pin();
  // Pick the direction to argue.
  var dir = options.dir();
  var picks = gen_picks(args_pool);
  var args = do_use_picks(dir, is_strict_pin, picks, args_pool);
  var new_pool = without_indexes(picks, args_pool);
  // Remove the picked arguments from the args_pool
  // var args_pool_ = without_indexes(picks, args_pool);
  // Return two values; the args and updated args_pool
  return { args:args, new_pool:new_pool, picks:picks };
}


function gen_picks(args_pool){
  return sortBy(random_indexes(args_pool));
}


function do_use_picks(dir, is_strict_pin, picks, args_pool){
  return handle_pin(dir, is_strict_pin, use_picks(dir, picks, args_pool));
}

function use_picks(dir, picks, args_pool){
  return is_sdir(dir) ? use_picks_split(picks, args_pool) : use_picks_dir(dir, picks, args_pool) ;
}

function use_picks_split(picks, args_pool){
  var args_sided = map(random_bisect(picks), use_picks_for(args_pool));
  return lha_append(args_sided[rdir], lpin(args_sided[ldir]));

  function use_picks_for(args_pool){
    return function(picks, dir){
      return use_picks(dir, picks, args_pool);
    };
  }
}

function use_picks_dir(dir, picks, args_pool){
  // Construct a range delimited by min pick and args_pool size
  // (if arguing rightward) or 0 and max pick (if arguing leftward).
  var pick_range = range.apply(null, [[0, max(picks)+1], [min(picks), size(args_pool)]][dir]);
  // Construct an instance which is the picked args with holes
  // making up anything that was skipped between picks.
  var args = map(pick_range, function(index){ return contains(picks, index) ? args_pool[index] : _ ; });
  // Add random trailing holes
  // TODO remove gen'd trailing holes given that it is now
  // considered an error.
  // args = args_append(dir, gen_holes(), args);
  return args;
}

function handle_pin(dir, is_strict_pin, args){
  // console.log(dir, is_strict_pin, args)
  if (is_rdir(dir) || (is_ldir(dir) && is_strict_pin)) {
    return pin(dir, args);
  } else {
    return args;
  }
}

// Vparam algorithm

Gen_Instance.vparam = args_gen_vparam;


function args_gen_vparam(pool, origin_pool){
  var picks =  gen_picks(pool);
  var args = do_use_picks(gen_dir(), gen_bool(), picks, origin_pool);
  // var pool_ = without_indexes(picks, pool);
  return args;
}


// function args_accomodate_rstock(pin_type, fuzz, args){
//   if (pin_type === 3 || pin_type === 2) return args;
//   var count;
//   var real_args = without(args, _, ___);
//   log('args_accomodate_rstock real_args %j', real_args);
//   each(real_args, function(arg, i){
//     count = count_of_smaller_rstock_args(fuzz.args, arg, real_args[i-1] || 0);
//     log('args_accomodate_rstock arg %d  |  count_of_smaller_rstock_args %d', arg, count);
//     args.splice.apply(args, [args.indexOf(arg), 0].concat(amass(partial(identity, _), count)));
//   });
//   return args;

//   function count_of_smaller_rstock_args(args_history, arg, but_greater_than){
//     var count = 0;
//     each(args_history, function(historical_args){
//       log('count_of_smaller_rstock_args indexOf ___', historical_args.indexOf(___))
//       if (historical_args.indexOf(___) >= 0){
//         each(without(historical_args.slice(historical_args.indexOf(___)+1), _), function(historical_arg){
//           // console.log(historical_arg);
//           log('historical_arg %d in range', historical_arg, but_greater_than < historical_arg && historical_arg < arg)
//           if (but_greater_than < historical_arg && historical_arg < arg) count++;
//         })
//       }
//     })
//     return count;
//   }
// }

// Private Library.

// Direction logic

var ldir = 0;
var rdir = 1;
var sdir = 2;
function is_ldir(dir){ return dir === ldir; }
function is_rdir(dir){ return dir === rdir; }
function is_sdir(dir){ return dir === sdir; }
function gen_dir(){ return random(0, 2); }

// Add a pin to an argument array

var pin = curry(function(dir, args){
  return args_append(dir, [___], args);
});
var lpin = pin(ldir);
var rpin = pin(rdir);


// Concatenate an array to an argument array

var args_concat = curry(function(is_append, dir, values, args){
  // If is_lhs then head is to the right, but
  // if not is_lhs then head is to the left.
  // leftdir append: append
  // leftdir prepend: prepend
  // rigthdir append: prepend
  // rightdir prepend: append
  // console.log(dir, is_ldir(dir), is_append);
  return is_ldir(dir) === is_append ? args.concat(values) : values.concat(args) ;
});

var args_append = args_concat(true);
var lha_append = args_append(ldir);
var args_prepend = args_concat(false);
var rha_prepend = args_prepend(rdir);


Gen_Instance.lpin = lpin;