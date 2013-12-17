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

module.exports = function stock_vargs(f, _l_stock, _l_holey, _l_min, _r_stock, _r_holey, _r_min){
  return function(){
    var arguments_count = arguments.length;

    // Bail if no arguments given
    if (!arguments_count) {
      // console.log('Invoked without arguments, early exit');
      return f.apply(null, unify_stock(_l_holey, clone_array(_l_stock), _r_stock));
    }

    // index for various loops below
    var i;

    // console.log('\n\nInvoked: | l_stock %j | r_stock %j | new args %j', _l_stock, _r_stock, arguments)

    // Stock cloning, to avoid clobbering
    var l_stock = clone_array(_l_stock);
    var r_stock = clone_array(_r_stock);

    // State shadowing, to avoid clobbering
    var l_min = _l_min;
    var r_min = _r_min;

    // If the first argument is a pin it means there is no left shoulder
    // and it means whatever left-shoulder state we had, still is.
    var l_holey = arguments[0] === ___ ? _l_holey : false ;
    var r_holey = false;

    var is_delayed_execution = false;
    var stock = l_stock;
    var argument;
    var stock_i = l_min;
    var incby = 1;
    var endloop = arguments_count;
    // var stock_i_limit = r_min + 1;
    var stock_i_limit = stock.length;
    var hole_count = l_holey;
    var _hole_count = _l_holey;
    process_l_arguments:
    for(i = 0; i !== endloop; i += incby) {
      // console.log('\nITERATION START\nEnd when: %d !== %d | stock_i: %d', i, endloop, stock_i);
      argument = arguments[i];

      if (argument === _) {
        is_delayed_execution = true;
        // If _ is last argument it has no affect
        // other than delaying execution.
        if (i + incby === endloop) break;
        incby === 1 ? l_holey = true : r_holey = true ;
        hole_count = true;
        //stock_i += incby
        // console.log('Hit Hole _');
        //continue;
      }

      if (argument === ___) {
        is_delayed_execution = true;
        if (i + incby === endloop) break;
        // Switch to right shoulder
        stock_i_limit = r_stock.length;
        stock = r_stock;
        stock_i = 0;
        hole_count = r_holey;
        _hole_count = _r_holey;
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
            incby === 1 ? l_holey = true : r_holey = true ;
          }
          stock_i++;
        }
        // console.log('Add argument: %j @ %d', argument, stock_i);
        stock[stock_i] = argument;
        // if      (stock_i_min === stock_i) { l_min++; }
        // else if (stock_i_max === stock_i) { r_min--; }
        stock_i++;
      } else {
        // console.log('Add argument: %j @ %d', argument, stock_i);
        stock.push(argument);
        // if      (stock_i_min === stock_i) { l_min++; }
        // else if (stock_i_max === stock_i) { r_min--; }
        stock_i++;
        stock_i_limit++;
      }
      // console.log('State: Stock: %j %j', l_stock, r_stock);
    }

    // If incby is not -1 it means there was never a right shoulder
    // and it means whatever right-shoulder state we had, still is.
    if (incby === 1) {
      r_holey = _r_holey;
    }

    // console.log('\nPROCESSING COMPLETE\nDelayed execution? %j\nStock: %j %j\nHoley: %j %j', is_delayed_execution, l_stock, r_stock, l_holey, r_holey)
    return is_delayed_execution ?
      stock_vargs(f, l_stock, l_holey, l_min, r_stock, r_holey, r_min) :
      f.apply(null, unify_stock(l_holey, l_stock, r_stock)) ;
  };
}



function unify_stock(l_holey, l_stock, r_stock){
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