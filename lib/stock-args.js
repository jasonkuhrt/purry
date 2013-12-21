var clone_array = require('./clone-array');
var debug = require('./debug');
var errors = require('./errors');
var syntax = require('./syntax');
var _ = syntax.hole.value,
    ___ = syntax.pin.value;



module.exports = function stock_args(f, _remaining, _stock, _l_stock_i_min, _l_stock_i_max_next, _r_stock_i_min, _r_stock_i_max_next, _hole_count, _r_hole_count){
  return function intercept_arguments(){
    var arguments_count = arguments.length;

    // Bail if no arguments given
    if (!arguments_count) {
      return _remaining ? intercept_arguments : f.apply(null, _stock)  ;
    }

    // debug.start(arguments);
    // debug.log('     _remaining: %d  | _l_stock_i_min: %d  | _l_stock_i_max_next: %d  | _r_stock_i_min: %d  | _r_stock_i_max_next: %d  | _hole_count: %d  | _r_hole_count: %d  | _stock: %j', _remaining, _l_stock_i_min, _l_stock_i_max_next, _r_stock_i_min, _r_stock_i_max_next, _hole_count, _r_hole_count, _stock);

    // Stock cloning, to avoid clobbering
    // We can use argument min/max to avoid
    // array-access (better performance). If we are
    // above/below min/max we know we're dealing
    // with unfilled params. This optimization cannot
    // be used with holey functions.
    var stock = _hole_count || _r_hole_count ?
      clone_array(_stock) :
      clone_stock(_stock, _l_stock_i_min, _r_stock_i_min, _) ;


    // State shadowing, to avoid clobbering
    var remaining = _remaining;
    var l_stock_i_min = _l_stock_i_min;
    var l_stock_i_max_next = _l_stock_i_max_next;
    var r_stock_i_min = _r_stock_i_min;
    var r_stock_i_max_next = _r_stock_i_max_next;

    var hole_count = _hole_count;
    var r_hole_count = _r_hole_count;
    var buffered_hole_count = 0;
    var hole_count_instance = hole_count;

    var has_right_shoulder = false;
    var is_delayed_execution = false;

    var i = 0;
    var argument;
    var stock_i = l_stock_i_min;
    var endloop = arguments_count;
    var stock_i_limit = r_stock_i_min + 1;
    process_l_arguments:
    for(; i < endloop; i++) {
      argument = arguments[i];
      // debug.loop(i, endloop, argument);
      // debug.log(' INIT remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);

      if (argument === ___) {
        is_delayed_execution = true;
        if (i + 1 === endloop) { i++; break; }
        has_right_shoulder = true;
        hole_count_instance = r_hole_count;
        stock_i = r_stock_i_min;
        stock_i_limit = l_stock_i_min - 1;
        endloop = i;
        i = arguments_count - 1;
        // debug.log('  EXT remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  | stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);
        break;
      }

      if (argument === _) {
        is_delayed_execution = true;
        // If _ is last argument it has no affect
        // other than delaying execution.
        if (i + 1 === endloop) break;
        if (stock_i === l_stock_i_max_next) {
          // debug.log('  Match instance hole to never-seen stock param');
          buffered_hole_count++;
          l_stock_i_max_next++;
          stock_i++;
        } else {
          // debug.log('  Match instance hole to already-seen stock hole');
          stock_i = --hole_count_instance ? stock_i + 1 :  l_stock_i_max_next;
        }
        // debug.log('  FIN remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock_i: %d  |  stock: %j', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock_i, stock);
        continue;
      }

      hole_count += buffered_hole_count ;
      buffered_hole_count = 0;
      // debug.log('  BUF remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);

      // TODO break, really? Or continue? If we break but have an unread _ or ___ then we miss noting that this is a delayed invocation?...
      if (stock_i === stock_i_limit) break;

      if (hole_count_instance) {
        while (stock[stock_i] !== _) {
          // If an argument falls out of bounds, discard it.
          // Also discard everything after, because all subsequent
          // arguments will be out of bounds too.
          if (stock_i === stock_i_limit) {
            // debug.log('  EXT stock_i (%d) reached stock_i_limit (%d)', stock_i, stock_i_limit);
            break process_l_arguments;
          }
          stock_i++;
        }
        // debug.log('  Match instance arg (%d) to already-seen stock hole (%d)', argument, stock_i);
        hole_count--;
        hole_count_instance--;
        stock[stock_i] = argument;
        if (!hole_count) {
          // debug.log('  All stock holes are argued!');
          stock_i = l_stock_i_min = l_stock_i_max_next
        } else if (!hole_count_instance){
          // debug.log('  All instance holes are argued!');
          stock_i = l_stock_i_max_next;
        } else {
          // debug.log('  holes remain...');
          if (stock_i === l_stock_i_min) l_stock_i_min++;
          stock_i++;
        }
      } else {
        stock[stock_i] = argument;
        if (stock_i === l_stock_i_min) l_stock_i_min++;
        stock_i++;
      }

      if (stock_i > l_stock_i_max_next) l_stock_i_max_next = stock_i;
      remaining--;
      // debug.log('  FIN remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);
    }

    // If we have anything buffered it means
    // there were trailing holes, which should
    // be ignored. To ignore them, rollback the
    // i_max_next by the buffer size.
    l_stock_i_max_next -= buffered_hole_count;
    buffered_hole_count = 0;

    if (has_right_shoulder) {
      // debug.log('\nPROCESS R ARGUMENTS');
      // Don't need to handle:
      // - delayed execution tracking
      //   since being in this loop implies being delayed
      // - right-shoulder
      //   since only 1 is allowed per instnace
      process_r_arguments:
      for (; i > endloop; i--) {
        argument = arguments[i];
        // debug.loop(i - 1, endloop, argument);
        // debug.log(' INIT remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);
        if (argument === ___) throw errors.pins_error();
        if (argument === _) {
          if (i - 1 === endloop) {
            break;
          } else if (stock_i === r_stock_i_max_next) {
            // debug.log('  Match instance hole to never-seen stock param');
            buffered_hole_count++;
            stock_i--;
          } else {
            // debug.log('  Match instance hole to already-seen stock hole');
            stock_i = --hole_count_instance ? stock_i - 1 :  r_stock_i_max_next;
          }
          // debug.log('  FIN remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock_i: %d  |  stock: %j', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock_i, stock);
          continue;
        }

        r_hole_count += buffered_hole_count;
        buffered_hole_count = 0;
        // debug.log('  BUF remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);

        // TODO break, really? Or continue? If we break but have an unread _ or ___ then we miss noting that this is a delayed invocation?...
        if (stock_i === stock_i_limit) break;

        if (hole_count_instance) {
          while (stock[stock_i] !== _) {
            // If an argument falls out of bounds, discard it.
            // Also discard everything after, because all subsequent
            // arguments will be out of bounds too.
            if (stock_i === stock_i_limit) {
              // debug.log('  EXT stock_i (%d) reached stock_i_limit (%d)', stock_i, stock_i_limit);
              break process_r_arguments;
            }
            stock_i--;
          }
          // debug.log('  Match instance arg (%d) to already-seen hole (%d)', argument, stock_i);
          r_hole_count--;
          hole_count_instance--;
          stock[stock_i] = argument;
          if (!r_hole_count) {
            // debug.log('  All stock holes are argued!');
            stock_i = r_stock_i_min = r_stock_i_max_next ;
          } else if (!hole_count_instance){
            // debug.log('  All instance holes are argued!');
            stock_i = r_stock_i_max_next ;
          } else {
            // debug.log('  instance holes remain...');
            if (stock_i === r_stock_i_min) r_stock_i_min--;
            stock_i--;
          }
        } else {
          stock[stock_i] = argument;
          if (stock_i === r_stock_i_min) r_stock_i_min--;
          stock_i--;
        }

        if (stock_i < r_stock_i_max_next) r_stock_i_max_next = stock_i;
        remaining--;
        // debug.log('  FIN remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);
      }
    }

    // debug.log('\nEND\n      remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock);
    return is_delayed_execution || remaining ?
      stock_args(f, remaining, stock, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count) :
      f.apply(null, stock) ;
  };
}



// Private Helpers

function clone_stock(array, less_than, greater_than, else_value){
  var clone = [];
  var count = array.length;
  var i = 0;
  while(i < count) {
    clone.push(i < less_than || i > greater_than ? array[i] : else_value);
    i++;
  }
  return clone;
}