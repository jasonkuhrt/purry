var clone_array = require('./clone-array');



/*

Purry implementation for variable-parameter-count-functions

Currying is not supported because a target parameter count is not defined.
Partial left/between/right application is supported. Two arrays stock arguments
respective to either side. When the function is executed the stocked arguments
are merged and applied to the wrapped function. Merging entails filling left stock
holes with right stock arguments. Any remaining right-stock arguments are simply
appending to the left-stock.
*/

module.exports = function accumulate_variable_arguments(f, _stock_left, _is_stock_left_holey, _stock_right, _is_stock_right_holey, _l_stock_i_min, _r_stock_i_min){
  return function(){
    var arguments_count = arguments.length;

    // Bail if no arguments given
    if (!arguments_count) {
      // console.log('Invoked without arguments, early exit');
      return f.apply(null, unify_stock(_is_stock_left_holey, clone_array(_stock_left), _stock_right));
    }

    // index for various loops below
    var i;

    // console.log('\n\nInvoked: | stock_left %j | stock_right %j | new args %j', _stock_left, _stock_right, arguments)

    // Stock cloning, to avoid clobbering
    var stock_left = clone_array(_stock_left);
    var stock_right = clone_array(_stock_right);

    // State shadowing, to avoid clobbering
    var l_stock_i_min = _l_stock_i_min;
    var r_stock_i_min = _r_stock_i_min;

    // If the first argument is a pin it means there is no left shoulder
    // and it means whatever left-shoulder state we had, still is.
    var is_stock_left_holey = arguments[0] === ___ ? _is_stock_left_holey : false ;
    var is_stock_right_holey = false;

    var is_delayed_execution = false;
    var stock = stock_left;
    var argument;
    var stock_i = l_stock_i_min;
    var incby = 1;
    var endloop = arguments_count;
    // var stock_i_limit = r_stock_i_min + 1;
    var stock_i_limit = stock.length;
    var hole_count = is_stock_left_holey;
    var _hole_count = _is_stock_left_holey;
    process_l_arguments:
    for(i = 0; i !== endloop; i += incby) {
      // console.log('\nITERATION START\nEnd when: %d !== %d | stock_i: %d', i, endloop, stock_i);
      argument = arguments[i];

      if (argument === _) {
        is_delayed_execution = true;
        // If _ is last argument it has no affect
        // other than delaying execution.
        if (i + incby === endloop) break;
        incby === 1 ? is_stock_left_holey = true : is_stock_right_holey = true ;
        hole_count = true;
        //stock_i += incby
        // console.log('Hit Hole _');
        //continue;
      }

      if (argument === ___) {
        is_delayed_execution = true;
        if (i + incby === endloop) break;
        // Switch to right shoulder
        stock_i_limit = stock_right.length;
        stock = stock_right;
        stock_i = 0;
        hole_count = is_stock_right_holey;
        _hole_count = _is_stock_right_holey;
        // console.log('Hit shoulder ___ of size (%d)', (arguments_count - (i + 1)));
        // Process right-shoulder arguments right-to-left
        incby = -1;
        endloop = i;
        i = arguments_count;
        continue;
      }

      // console.log('holey shoulder(%d) so far? %j. In a previous instance? %j', incby, hole_count, _hole_count);
      // If there are holes in the shoulder we must try filling them before
      // appending our argument. This is a good feature for users but
      // a sub-optimal state for performance (loop-in-loop), thus heroic efforts
      // are made to escape this condition to revert back to the optimal simple-append
      // scenario.
      if (_hole_count || hole_count) {
        while (stock[stock_i] !== _) {
          // console.log('stock_i_limit %j === stock_i %j %j?', stock_i_limit, stock_i, stock_i_limit === stock_i);
          // If argument falls out of bounds, stop looking for holes,
          // increase the shoulder size, and move on.
          // If this happens it might mean no holes exist at least anymore.
          // but ultimately this is decided in concert with the check for '_'
          // above
          if (stock_i === stock_i_limit) {
            stock_i_limit++;
            break;
          }
          // Confirmed that this instance shoulder is holey
          // because our while loop did not exit immediately.
          if (!hole_count) {
            hole_count = true;
            incby === 1 ? is_stock_left_holey = true : is_stock_right_holey = true ;
          }
          stock_i++;
        }
        // console.log('Add argument: %j @ %d', argument, stock_i);
        stock[stock_i] = argument;
        // if      (stock_i_min === stock_i) { l_stock_i_min++; }
        // else if (stock_i_max === stock_i) { r_stock_i_min--; }
        stock_i++;
      } else {
        // console.log('Add argument: %j @ %d', argument, stock_i);
        stock.push(argument);
        // if      (stock_i_min === stock_i) { l_stock_i_min++; }
        // else if (stock_i_max === stock_i) { r_stock_i_min--; }
        stock_i++;
        stock_i_limit++;
      }
      // console.log('State: Stock: %j %j', stock_left, stock_right);
    }

    // If incby is not -1 it means there was never a right shoulder
    // and it means whatever right-shoulder state we had, still is.
    if (incby === 1) {
      is_stock_right_holey = _is_stock_right_holey;
    }

    // console.log('\nPROCESSING COMPLETE\nDelayed execution? %j\nStock: %j %j\nHoley: %j %j', is_delayed_execution, stock_left, stock_right, is_stock_left_holey, is_stock_right_holey)
    if (is_delayed_execution) {
      return accumulate_variable_arguments(f, stock_left, is_stock_left_holey, stock_right, is_stock_right_holey, l_stock_i_min, r_stock_i_min) ;
    } else {
      return f.apply(null, unify_stock(is_stock_left_holey, stock_left, stock_right)) ;
    }
  };
}



function unify_stock(is_stock_left_holey, stock_left, stock_right){
  var i = 0; var stock_i = 0;
  for (i=stock_right.length - 1, stock_i=0; i > -1; i--) {
    if (stock_right[i] === _) continue;
    while (stock_i !== stock_left.length && stock_left[stock_i] !== _) {
      stock_i++;
    }
    stock_left[stock_i] = stock_right[i];
    stock_i++;
  }
  // console.log('Stock: %j %j', stock_left, stock_right);
  return stock_left;
}