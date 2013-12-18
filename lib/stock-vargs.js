var clone_array = require('./clone-array');
var debug = require('./debug');



/*

Purry implementation for variable-parameter-count-functions

Currying is not supported because a target parameter count is not defined.
Partial left/between/right application is supported. Two arrays stock arguments
respective to either side. When the function is executed the stocked arguments
are merged and applied to the wrapped function. Merging entails filling left stock
holes with right stock arguments. Any remaining right-stock arguments are simply
appending to the left-stock.
*/

module.exports = function stock_vargs(f, _l_stock, _l_is_holey, _l_min, _r_stock, _r_is_holey, _r_min){
  return function intercept_vargs(){
    var arguments_count = arguments.length;

    // debug.start(arguments);
    // debug.state_vargs(_l_stock, _l_is_holey, _l_min, _r_stock, _r_is_holey, _r_min);

    // Bail if no arguments given
    if (!arguments_count) {
      // debug.early_exit_no_args(arguments);
      return f.apply(null, unify_stock(_l_is_holey, clone_array(_l_stock), _r_stock));
    }

    var i = 0;
    var arg;
    var i_end = -1;
    var has_left = true;
    var has_right = false;
    var saw_pin = 0;
    var saw_hole = false;
    var l_is_holey = false;
    var r_is_holey = false;
    for(; i < arguments_count; i++){
      arg = arguments[i];
      if (arg === _) {
        saw_hole = true;
        if (saw_pin) {
          // Holes after a pin DO count
          // towrd i_end.
          i_end = i;
          r_is_holey = true;
        } else {
          l_is_holey = true;
        }
      } else if (arg === ___) {
        saw_pin = i+1;
        // Left-pin always exists except:
        // - When first arg is a pin (i===0)
        // - When all left-pin args are holes (i_end===-1)
        if (i === 0 || i_end === -1) has_left = false;
      } else {
        // Right-pin only exists when:
        // - Any arg except the last is a pin
        //   and at least one right-pin arg is
        //   NOT a hole.
        if (saw_pin) has_right = true;
        i_end = i;
      };
    }

    // If i_end is 0 it means we were not given any
    // real arguments, only holes and/or pins. Bail
    // immediately via delayed execution.
    // if (i !== i_end+1) console.log(i, i_end+1, // debug.format_arguments(arguments));
    if (i_end === -1) {
      // debug.early_exit_no_real_args(arguments)
      return intercept_vargs;
    }

    // No left/right-pin means whatever pin state we had, still is.
    var l_stock, r_stock, l_min, r_min;

    if (has_left)  {
      // debug.log('\nLEFT');
      l_stock = stock_arguments(clone_array(_l_stock), arguments, 0, _l_min, (saw_pin ? saw_pin - 1 : i_end + 1), l_is_holey || _l_is_holey, 1) ;
      l_min = _l_min;
    } else {
      l_is_holey = _l_is_holey;
      l_stock = _l_stock;
      l_min = _l_min;
    }

    if (has_right) {
      // debug.log('\nRIGHT');
      r_stock = stock_arguments(clone_array(_r_stock), arguments, i_end, _r_min, saw_pin-1, (r_is_holey || _r_is_holey), -1) ;
      r_min = _r_min;
    } else {
      r_is_holey = _r_is_holey;
      r_stock = _r_stock;
      r_min = _r_min;
    }

    // debug.log('\nEND');
    // debug.state_vargs(l_stock, l_is_holey, l_min, r_stock, r_is_holey, r_min);
    return saw_hole || saw_pin ?
      stock_vargs(f, l_stock, l_is_holey, l_min, r_stock, r_is_holey, r_min) :
      f.apply(null, unify_stock(l_is_holey, l_stock, r_stock)) ;
  };
}



function stock_arguments(stock, args, i, stock_i, i_stop, is_holey, incby) {
  // var min = stock_i;

  if (is_holey) {
    var stock_i_limit = stock.length;
    var arg;
    slow_while:
    while (i !== i_stop) {
      // debug.loop(i, i_stop, args[i]);
      // debug.loop_state_vargs(min, stock_i, stock_i_limit, is_holey, stock);
      while (stock[stock_i] !== _) {
        if (stock_i === stock_i_limit) {
          // debug.log('UPGRADE < stock-limit reached');
          break slow_while;
        };
        stock_i++;
      }
      arg = args[i];
      // if (arg !== _ && stock_i === min) min++;
      stock[stock_i] = arg;
      stock_i++;
      // debug.loop_state_vargs(min, stock_i, stock_i_limit, is_holey, stock);
      i += incby;
    }
  }

  while (i !== i_stop) {
    // debug.loop(i, i_stop, args[i]);
    stock.push(args[i]);
    // min++;
    // debug.loop_state_vargs(min, stock_i, stock_i_limit, is_holey, stock);
    i += incby;
  }

  return stock;
}

function unify_stock(l_is_holey, l_stock, r_stock){
  var i = 0; var stock_i = 0;
  for (i=r_stock.length - 1, stock_i=0; i > -1; i--) {
    if (r_stock[i] === _) continue;
    while (stock_i !== l_stock.length && l_stock[stock_i] !== _) {
      stock_i++;
    }
    l_stock[stock_i] = r_stock[i];
    stock_i++;
  }
  // console.log('Stock: %j %j', l_stock, r_stock);
  return l_stock;
}