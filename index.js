/*
plug
partial:
shoulder:
hole:
value:
lh  : left-hand
rh  : right-hand
oh  : opposite-hand (means right in lha, left in rha)
ohh : opsite-hand holes
lhh : left-hand hole
rhh : right-hand hole
lha : left-hand args
rha : right-hand args

Anatomy:

[lha][rha]
  |    |
  ------
  [size]
    |
  (...)->
*/

var ___ = '___send-to-shoulder___';
var _ = '_hole_';




var store_args = function(args_stock, args_delivery){
  //console.log('\nstore_args:\n', args_delivery);
  return [args_delivery[1] ? apply_args(args_stock[0], args_delivery[2]) : args_stock[0],
          args_delivery[3] ? apply_args(args_stock[1], args_delivery[4]) : args_stock[1],
          args_stock[2],
          args_stock[3] + args_delivery[0]
         ];
};

var format_delivery = function(delivery_raw, space){
  var delivery_lha = {};
  var delivery_lha_count = 0;
  var delivery_rha = {};
  var delivery_rha_count = 0;
  var delivery_count = 0; // non-hole/shoulder args; used to calculate remaining space

  var arg;
  var arg_i = 0;
  var arg_i_next = 1;
  var arg_count = delivery_raw.length;

  var side = 0; // which side (starts on left=0, right=1)
  var side_i = 0;

  var hole_count = 0;
  var endloop = arg_count;

  for (; arg_i !== endloop; arg_i += arg_i_next, side_i++) {
    //console.log(endloop, arg_i, delivery_count, space, delivery_count >= space)

    // Stop, no more space
    if (delivery_count + hole_count >= space) break;

    // cache, micro-optimization
    arg = delivery_raw[arg_i];

    // Next loop, this one is a hole
    if (arg === _) {
      // count holes to ensure that we predictably drop args
      // (by adding holes to the space check above)
      // e.g. for: f(_,2,_,4,_,_)(1,3,_,5,6);
      // 6 gets dropped because only four params remain
      //
      hole_count++;
      continue;
    }

    if (arg === ___) {
      // Prepare backwards loop for rha access
      endloop = arg_i;
      // this will be + -1 in 'final-expression' (pre-condition eval) so we must not `- 1` here
      arg_i = arg_count;
      arg_i_next = -1;
      // Change side
      side = 1;
      // this will be +1 in 'final-expression' (pre-condition eval) so we must not `= 0` here
      side_i = -1;
      //console.log(endloop, arg_i, delivery_count, space, delivery_count >= space)
      continue;
    } // Next loop, this one is a shoulder

    if (!side){
      delivery_lha[side_i] = arg;
      delivery_lha_count++;
    } else {
      delivery_rha[side_i] = arg;
      delivery_rha_count++;
    }
    delivery_count++; // note the added arg
  }
  //console.log('\nformat_delivery:\ndelivery_raw: %j\ndelivery_lha: %j, %d\ndelivery_rha: %j, %d\ndelivery_count: %j', delivery_raw, delivery_lha, delivery_lha_count, delivery_rha, delivery_rha_count, delivery_count);
  return [delivery_count, delivery_lha_count, delivery_lha, delivery_rha_count, delivery_rha];
};



var apply_args = function(stock_shoulder, delivery_shoulder){
  // Merge new args with existing args.
  // Iterate over new args using apply_arg
  // which returns the resolved index to optimize
  // the next run (start where the last left off instead of 0).
  // At the end we return only the new accumulated args, throwing
  // index away
  var i = 0;
  var shoulder_i_reached = 0;
  var prev_offset = 0;
  var prop_name;
  for (prop_name in delivery_shoulder) {
    if (delivery_shoulder.hasOwnProperty(prop_name)) {
      shoulder_i_reached = apply_arg(stock_shoulder, delivery_shoulder[prop_name], shoulder_i_reached, (Number(prop_name) - i) - prev_offset);
      prev_offset = Number(prop_name) - i;
      i++;
    }
  }
  //console.log('\napply_args:\nstock_shoulder: %j\ndelivery_shoulder: %j\nresult: %j', stock_shoulder, delivery_shoulder, result);
  return stock_shoulder;
};



// Recursively try adding a given arg@index to an existing argument-set,
// returning a new argument set once the given argument@index is applied.
//
// The existing argument set may or may not already have a value
// at the given index. If it does, the given index is incremented by 1
// and then tried again. If it does not, a new object is made that includes
// the given arg. In short, the function is applied recursively until a
// hole is found.
//
apply_arg = function(stock_shoulder, arg, arg_index, arg_offset){
  // console.log('arg value %d: index: %d | offset: %d | free: %s', arg, arg_index, arg_offset, !stock_shoulder.hasOwnProperty(arg_index));
  // Find the first free space for this arg in this shoulder.
  var spot_not_found = true
  while (spot_not_found) {
    if (stock_shoulder.hasOwnProperty(arg_index)) {
      arg_index++;
    } else if(arg_offset) {
      arg_index++;
      arg_offset--;
    } else {
      spot_not_found = false;
    }
  }

  stock_shoulder[arg_index] = arg;
  return arg_index + 1;
}



resolve_arg_storage = function(args_stock){
  //console.log('\nresolve_arg_storage:\nargs_stock: %j', args_stock);
  var lha = args_stock[0];
  var rha = args_stock[1];
  // TODO not cross-browser compatible
  // Sorting is lexicgraphically, works with numbers here because keys are strings '0' not 0
  // '0' will appear before '1' etc
  var rha_indexes = Object.keys(rha);
  var rha_indexes_sorted = rha_indexes.sort();
  var i = rha_indexes_sorted.length - 1;
  var lha_i_reached = 0;
  // Apply rha to lha
  // To do so we must access farther lefts before farther rights.
  // To do so we must reduceRight because rha are stored backwards meaning lowest index is farthest right.
  //
  // Offset is no longer cared for. Plugging in-order is prioritized over honouring offsets.
  // If offsets do not pan out at this stage too bad. TODO should we warn/throw errors somehow?
  for (; i > -1; i--) {
    lha_i_reached = apply_arg(lha, rha[rha_indexes_sorted[i]], lha_i_reached, 0);
  }

  // TODO optimize?
  var lha_indexes = Object.keys(lha);
  var lha_indexes_sorted = lha_indexes.sort();
  var j = 0;
  var array = [];
  for (; j < lha_indexes_sorted.length; j++) {
    array.push(lha[lha_indexes_sorted[j]]);
  }

  //console.log('\nresolve_arg_storage:\nargs_stock: %j\nresult: %j\n', args_stock, result);
  return array;
};



var partialize = module.exports = function(f){
  if (f.length === 0) throw new Error('purry is not compatible with variable-argument functions.')
  return (function accumulate_arguments(_args_stock){
    return function(/* ...args_new_raw */){
      // One-time shoulder clones so instances don't clobber each other.
      // Each instance, here on, mutates the shoulders for performance gain
      // Instances *never* mutate the lha/rha **values** thus we do not need to worry about "deep cloning"
      var args_new_raw = Array.prototype.slice.apply(arguments);
      var space_before = _args_stock[2] - _args_stock[3];
      if (is_no_curry_no_partial_case(_args_stock, args_new_raw)){
        return f.apply(null, args_new_raw);
      }
      var args_stock = [shallow_clone(_args_stock[0]), shallow_clone(_args_stock[1]), _args_stock[2], _args_stock[3]];
      var args_stock_ = args_new_raw.length ? store_args(args_stock, format_delivery(args_new_raw, space_before)) : args_stock ;
      var space_after = args_stock_[2] - args_stock_[3];
      return is_partial(args_new_raw) || space_after ?
        accumulate_arguments(args_stock_) :
        f.apply(null, resolve_arg_storage(args_stock_)) ;
    };
  // args_stock has the following fields:
  // [<lha>, <rha>, <capacity>, <capacity-used>]
  }([{}, {}, f.length, 0]));
};

partialize._ = _;
partialize.___ = ___;



// Helpers
function is_no_curry_no_partial_case(stock, new_args){
  return !stock[3] && new_args.length === stock[2] && !is_partial(new_args);
}

function is_partial(args){
  return args.length && (~args.indexOf(_) || ~args.indexOf(___));
};

function shallow_clone(obj){
  var target = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      target[i] = obj[i];
    }
  }
  return target;
}