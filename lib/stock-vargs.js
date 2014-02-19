var format = require('../test/lib/format');
var clone_array = require('./clone-array');
var debug = require('./debug');
var errors = require('./errors');
var syntax = require('./syntax');
var _ = syntax.hole.value,
    ___ = syntax.pin.value;



/*

Purry implementation for variable-parameter-count-functions

Currying is not supported because a target parameter count is not defined.
Partial left/between/right application is supported. Two arrays stock arguments
respective to either side. When the function is executed the stocked arguments
are merged and applied to the wrapped function. Merging entails filling left stock
holes with right stock arguments. Any remaining right-stock arguments are simply
appending to the left-stock.
*/

module.exports = function stock_vargs(f, _l_stock, _l_hole_count, _l_min, _r_stock, _r_hole_count, _r_min){
  return function intercept_vargs(){
    var arguments_count = arguments.length;

    // debug.start(arguments);
    // debug.state_vargs(_l_stock, _l_hole_count, _l_min, _r_stock, _r_hole_count, _r_min);

    // Bail if no arguments given
    if (!arguments_count) {
      // debug.early_exit_no_args(arguments);
      return f.apply(null, unify_stock(_l_hole_count, clone_array(_l_stock), _r_stock));
    }

    var i = 0;
    var arg;
    var i_end = -1;
    var saw_hole = false;
    var saw_pin = 0;
    var is_delayed = false;
    var l_real_count = 0;
    var r_real_count = 0
    while (i < arguments_count) {
      arg = arguments[i];
      if (arg === _) {
        saw_hole = true;
        is_delayed = true;
        if (saw_pin) {
          // Holes after a pin DO count
          // towrd i_end.
          i_end = i;
        }
      } else if (arg === ___) {
        if (saw_pin) throw errors.pins_error();
        saw_pin = i + 1;
        is_delayed = true;
      } else {
        saw_pin ? r_real_count++ : l_real_count++ ;
        i_end = i;
      };
      i++;
    }
    if (saw_pin === arguments_count){ saw_pin = 0; }
    // debug.log(format.invocation(arguments), l_real_count, r_real_count);

    // If i_end is 0 it means we were not given any
    // real arguments, only holes and/or pins. Bail
    // immediately via delayed execution.
    if (i_end === -1) {
      // debug.early_exit_no_real_args(arguments)
      return intercept_vargs;
    }

    // No left/right-pin means whatever pin state we had, still is.
    var l_stock, l_hole_count, l_min, r_stock, r_hole_count, r_min;

    if (l_real_count)  {
      // debug.log('\nLEFT');
      var lr = stock_arguments(clone_array(_l_stock), arguments, 0, _l_min, (saw_pin ? saw_pin - 1 : i_end + 1), _l_hole_count, 1) ;
      l_stock = lr[0];
      l_hole_count = lr[1];
      l_min = _l_min;
    } else {
      l_stock = _l_stock;
      l_hole_count = _l_hole_count;
      l_min = _l_min;
    }

    if (r_real_count) {
      // debug.log('\nRIGHT');
      var rr = stock_arguments(clone_array(_r_stock), arguments, i_end, _r_min, saw_pin - 1, _r_hole_count, -1) ;
      r_stock = rr[0];
      r_hole_count = rr[1];
      r_min = _r_min;
    } else {
      r_stock = _r_stock;
      r_hole_count = _r_hole_count;
      r_min = _r_min;
    }

    // debug.log('\nEND');
    // debug.state_vargs(l_stock, l_hole_count, l_min, r_stock, r_hole_count, r_min);
    // debug.log(format.arguments(l_stock));
    // debug.log(format.arguments(r_stock));
    return is_delayed ?
      stock_vargs(f, l_stock, l_hole_count, l_min, r_stock, r_hole_count, r_min) :
      f.apply(null, unify_stock(l_hole_count, l_stock, r_stock)) ;
  };
}



function stock_arguments(stock, args, i, stock_i, i_stop, is_holey, incby) {
  var min = stock_i;
  var arg;

  if (is_holey) {
    var stock_i_limit = stock.length;
    slow_while:
    while (i !== i_stop) {
      arg = args[i];
      // debug.loop(i, i_stop, args[i]);
      // debug.loop_state_vargs(min, stock_i, stock_i_limit, is_holey, stock);
      while (true) {
        if (stock[stock_i] === _) {
          if (arg !== _ && !(--is_holey)) {
            stock[stock_i] = arg;
            i += incby;
            // debug.log('UPGRADE < No more holes < %j', stock);
            break slow_while;
          }
          break;
        } else if (stock_i === stock_i_limit) {
          stock.push(arg);
          i += incby;
          // debug.log('UPGRADE < stock-limit reached');
          break slow_while;
        } else {
          stock_i++;
        };
      }
      // if (arg !== _ && stock_i === min) min++;
      stock[stock_i] = arg;
      stock_i++;
      i += incby;
      // debug.loop_state_vargs(min, stock_i, stock_i_limit, is_holey, stock);
    }
  }

  while (i !== i_stop) {
    arg = args[i];
    // debug.loop(i, i_stop, args[i]);
    if (arg === _) is_holey++;
    stock.push(arg);
    // min++;
    i += incby;
  }

  return [stock, is_holey];
}

function unify_stock(l_hole_count, l_stock, r_stock){
  var i = 0; var stock_i = 0;
  for (i=r_stock.length - 1, stock_i=0; i > -1; i--) {
    if (r_stock[i] === _) continue;
    while (stock_i !== l_stock.length && l_stock[stock_i] !== _) {
      stock_i++;
    }
    l_stock[stock_i] = r_stock[i];
    stock_i++;
  }
  return l_stock;
}