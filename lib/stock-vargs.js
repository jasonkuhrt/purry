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
    var saw_pin = false;
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
        saw_pin = true;
        // Left-pin always exists except:
        // - When first arg is a pin (i===0)
        // - When all left-pin args are holes (i_end===0)
        if (i === 0 || i_end === 0) has_left = false;
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
    // if (i !== i_end+1) console.log(i, i_end+1, debug.format_arguments(arguments));
    if (i_end === -1) {
      // debug.early_exit_no_real_args(arguments)
      return intercept_vargs;
    }

    // TODO?
    // If we saw no pin/hole and the argument count
    // is equal to unargued params we may exit early?

    // No left/right-pin means whatever pin state we had, still is.
    if (!has_left)  l_is_holey = _l_is_holey;
    if (!has_right) r_is_holey = _r_is_holey;

    // Stock cloning, to avoid clobbering
    var l_stock = clone_array(_l_stock);
    var r_stock = clone_array(_r_stock);

    // State shadowing, to avoid clobbering
    var l_min = _l_min;
    var r_min = _r_min;

    // Loop variables
    i = 0;
    var incby = 1;
    var endloop = i_end + 1;
    // Stock variables.
    // Create aliases to l identifiers.
    // These will be re-assigned to r identifiers
    // if a right-pin is encountered.
    var stock_i = l_min;
    var stock = l_stock;
    var stock_i_limit = l_stock.length;
    var is_holey = l_is_holey || _l_is_holey;
    // A count that tracks how many successive
    // holes have been buffered. They are buffered
    // because they only apply if followed by an a
    // non-hole/pin argument

    process_l_arguments:
    for(; i !== endloop; i += incby) {
      arg = arguments[i];
      // debug.loop(i, endloop, arg);
      // debug.loop_state_vargs(stock_i, stock_i_limit, is_holey, stock);

      if (arg === ___) {
        // Switch to right shoulder
        stock_i_limit = r_stock.length;
        stock = r_stock;
        stock_i = 0;
        is_holey = r_is_holey || _r_is_holey;
        // Process right-shoulder arguments right-to-left
        incby = -1;
        endloop = i;
        i = arguments_count;
        continue;
      }

      // TODO nothing for this case anymore??
      // if (arg === _) {}


      // console.log('holey shoulder(%d) so far? %j. In a previous instance? %j', incby, is_holey, _is_holey);
      // If there are holes in the shoulder we must try filling them before
      // appending our argument. This is a good feature for users but
      // a sub-optimal state for performance (loop-in-loop), thus heroic efforts
      // are made to escape this condition to revert back to the optimal simple-append
      // scenario.
      if (is_holey) {
        while (stock[stock_i] !== _) {
          // console.log('stock_i_limit %j === stock_i %j %j?', stock_i_limit, stock_i, stock_i_limit === stock_i);
          // If arg falls out of bounds, stop looking for holes,
          // increase the shoulder size, and move on.
          // If this happens it might mean no holes exist at least anymore.
          // but ultimately this is decided in concert with the check for '_'
          // above
          if (stock_i === stock_i_limit) {
            stock_i_limit++;
            // incby === 1 ? l_min++ : r_min++ ;
            break;
          }
          stock_i++;
        }
        // console.log('Add arg: %j @ %d', arg, stock_i);
        stock[stock_i] = arg;
        // if      (stock_i_min === stock_i) { l_min++; }
        // else if (stock_i_max === stock_i) { r_min--; }
        stock_i++;
      } else {
        // console.log('Add arg: %j @ %d', arg, stock_i);
        stock.push(arg);
        // if      (stock_i_min === stock_i) { l_min++; }
        // else if (stock_i_max === stock_i) { r_min--; }
        stock_i++;
        stock_i_limit++;
        // incby === 1 ? l_min++ : r_min++ ;
      }
      // console.log('State: Stock: %j %j', l_stock, r_stock);
      // debug.loop_state_vargs(stock_i, stock_i_limit, is_holey, stock);
    }



    // console.log('\nEND  |  Delayed execution? %j', is_delayed_execution);
    // debug.state_vargs(l_stock, l_is_holey, l_min, r_stock, r_is_holey, r_min);
    return saw_hole || saw_pin ?
      stock_vargs(f, l_stock, l_is_holey, l_min, r_stock, r_is_holey, r_min) :
      f.apply(null, unify_stock(l_is_holey, l_stock, r_stock)) ;
  };
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