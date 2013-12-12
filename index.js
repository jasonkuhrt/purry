var ___ = '___send-to-shoulder___';
var _ = '_hole_';


var purry = module.exports = function(f){
  if (f.length) {
    var initial_stock = [];
    var i = f.length;
    while(i > 0){
      initial_stock.push(_);
      i--;
    }
    return accumulate_arguments(f, f.length, 0, initial_stock, 0, f.length - 1, false);
  } else {
    return accumulate_variable_arguments(f, [], false, [], false, 0, 0);
  }
};



// @f –– The wrapped function
// @capacity –– The param count of f
// @_capacity_used –– The remaining holes of _stock
// @_stock –– The plugged holes so far
// @_stock_i_min –– The minimum index to start stocking at.
function accumulate_variable_arguments(f, _stock_left, _is_stock_left_holey, _stock_right, _is_stock_right_holey, _stock_i_min, _stock_i_max){
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
    var stock_i_min = _stock_i_min;
    var stock_i_max = _stock_i_max;

    var is_stock_left_holey = false;
    var is_stock_right_holey = false;

    var is_delayed_execution = false;
    var stock = stock_left;
    var argument;
    var stock_i = stock_i_min;
    var incby = 1;
    var endloop = arguments_count;
    // var limit = stock_i_max + 1;
    var limit = stock.length;
    var is_holey = is_stock_left_holey;
    var _is_holey = _is_stock_left_holey;
    process_new_arguments:
    for(i = 0; i !== endloop; i += incby) {
      // console.log('\nITERATION START\nEnd when: %d !== %d | stock_i: %d', i, endloop, stock_i);
      argument = arguments[i];

      if (argument === _) {
        is_delayed_execution = true;
        // If _ is last argument it has no affect
        // other than delaying execution.
        if (i + incby === endloop) break;
        incby === 1 ? is_stock_left_holey = true : is_stock_right_holey = true ;
        is_holey = true;
        //stock_i += incby
        // console.log('Hit Hole _');
        //continue;
      }

      if (argument === ___) {
        is_delayed_execution = true;
        if (i + incby === endloop) break;
        // Switch to right shoulder
        limit = stock_right.length;
        stock = stock_right;
        stock_i = 0;
        is_holey = is_stock_right_holey;
        _is_holey = _is_stock_right_holey;
        // console.log('Hit shoulder ___ of size (%d)', (arguments_count - (i + 1)));
        // Process right-shoulder arguments right-to-left
        incby = -1;
        endloop = i;
        i = arguments_count;
        continue;
      }

      // console.log('holey shoulder(%d) so far? %j. In a previous instance? %j', incby, is_holey, _is_holey);
      // If there are holes in the shoulder we must try filling them before
      // appending our argument. This is a good feature for users but
      // a sub-optimal state for performance (loop-in-loop), thus heroic efforts
      // are made to escape this condition to revert back to the optimal simple-append
      // scenario.
      if (_is_holey || is_holey) {
        while (stock[stock_i] !== _) {
          // console.log('limit %j === stock_i %j %j?', limit, stock_i, limit === stock_i);
          // If argument falls out of bounds, stop looking for holes,
          // increase the shoulder size, and move on.
          // If this happens it might mean no holes exist at least anymore.
          // but ultimately this is decided in concert with the check for '_'
          // above
          if (stock_i === limit) {
            limit++;
            break;
          }
          // Confirmed that this instance shoulder is holey
          // because our while loop did not exit immediately.
          if (!is_holey) {
            is_holey = true;
            incby === 1 ? is_stock_left_holey = true : is_stock_right_holey = true ;
          }
          stock_i++;
        }
        // console.log('Add argument: %j @ %d', argument, stock_i);
        stock[stock_i] = argument;
        // if      (stock_i_min === stock_i) { stock_i_min++; }
        // else if (stock_i_max === stock_i) { stock_i_max--; }
        stock_i++;
      } else {
        // console.log('Add argument: %j @ %d', argument, stock_i);
        stock.push(argument);
        // if      (stock_i_min === stock_i) { stock_i_min++; }
        // else if (stock_i_max === stock_i) { stock_i_max--; }
        stock_i++;
        limit++;
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
      return accumulate_variable_arguments(f, stock_left, is_stock_left_holey, stock_right, is_stock_right_holey, stock_i_min, stock_i_max) ;
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



// @f –– The wrapped function
// @capacity –– The param count of f
// @_capacity_used –– The remaining holes of _stock
// @_stock –– The plugged holes so far
// @_stock_i_min –– The minimum index to start stocking at.
function accumulate_arguments(f, capacity, _capacity_used, _stock, _stock_i_min, _stock_i_max, _is_holey){
  var _is_capacity_full = capacity === _capacity_used;
  return function intercept_arguments(){
    var arguments_count = arguments.length;

    // Bail if no arguments given
    if (!arguments_count) {
      return _is_capacity_full ? f.apply(null, _stock) : intercept_arguments ;
    }

    // index for various loops below
    var i;

    // console.log('\n\nInvoked: capacity %d | instance capacity %d | stock %j | new args %j', capacity, capacity - _capacity_used, _stock, arguments)

    // Stock cloning, to avoid clobbering
    // We can use argument min/max to avoid
    // array-access (better performance). If we are
    // above/below min/max we know we're dealing
    // with unfilled params. This optimization cannot
    // be used with holey functions.
    var stock = [];
    var _stock_count = _stock.length;
    i = 0;
    while(i < _stock_count) {
      if (_is_holey || i < _stock_i_min || i > _stock_i_max) {
        stock.push(_stock[i]);
      } else {
        stock.push(_);
      }
      i++;
    }

    // State shadowing, to avoid clobbering
    var capacity_used = _capacity_used;
    var stock_i_min = _stock_i_min;
    var stock_i_max = _stock_i_max;
    // Can we use the get-out-of-hole-later optimization
    // found in accumulate_variable_arguments?
    var is_holey = _is_holey;

    var is_delayed_execution = false;
    var argument;
    var stock_i = stock_i_min;
    var incby = 1;
    var endloop = arguments_count;
    var limit = stock_i_max + 1;
    process_new_arguments:
    for(i = 0; i !== endloop; i += incby) {
      // console.log('\nend condition: %d !== %d | stock_i: %d', i, endloop, stock_i);
      argument = arguments[i];

      if (argument === _) {
        is_delayed_execution = true;
        // If _ is last argument it has no affect
        // other than delaying execution.
        if (i + incby === endloop) break;
        is_holey = true;
        stock_i += incby
        // console.log('Hit Hole _, offset @ %d');
        continue;
      }

      if (argument === ___) {
        is_delayed_execution = true;
        if (i + incby === endloop) break;
        incby = -1;
        stock_i = stock_i_max;
        limit = stock_i_min - 1;
        // console.log('Hit shoulder ___ of size (%d)', (arguments_count - (i + 1)));
        endloop = i;
        i = arguments_count;
        continue;
      }

      if (is_holey) {
        while (stock[stock_i] !== _) {
          // If an argument falls out of bounds, discard it.
          // Also discard everything after, because all subsequent
          // arguments will be out of bounds too.
          if (stock_i === limit) break process_new_arguments;
          stock_i += incby;
        }
      }

      // With an argument and and its resolved index in hand,
      // stock it!
      // console.log('Add argument: %j @ i%d', argument, stock_i);
      stock[stock_i] = argument;
      // Take note of new argument minimum/maximums.
      // For example if the min is at 0 and we fill 0 we know we can
      // never fill it again.
      // These markers allow subsequent invocation to start/stop
      // stock_i at optimized points meaning a certain amount of
      // loops are skipped. In fact if allows us to only require a
      // inner while-loop for holey-functions.
      if      (stock_i_min === stock_i) { stock_i_min++; }
      else if (stock_i_max === stock_i) { stock_i_max--; }
      capacity_used++;
      stock_i += incby;
      // console.log('stock: %j', stock);
    }


    // console.log('\nProcessing Complete. ')
    // console.log('Not applicable, stock: %j', stock);
    // console.log('Applicable! %j', stock);
    return is_delayed_execution || capacity !== capacity_used ?
      accumulate_arguments(f, capacity, capacity_used, stock, stock_i_min, stock_i_max, is_holey) :
      f.apply(null, stock) ;
  };
}

purry._ = _;
purry.___ = ___;

var previous_global_val_;
var previous_global_val___;
var global_ident_;
var global_ident___;

// Install global identifiers for hole and shoulder.
purry.install = function(symbol_, symbol___){
  purry.installSyntax(symbol_, symbol___);
  // TODO Expose purry on function prototype.
  // Function.prototype.purry = purry;
};

// Uninstall global identifiers for hole and shoulder.
// Restore those identifiers to whatever they were prior.
purry.noConflict = function(){
  GLOBAL[global_ident_] = previous_global_val_;
  GLOBAL[global_ident___] = previous_global_val___;
};

// Install global identifiers for hole and shoulder.
purry.installSyntax = function(symbol_, symbol___){
  global_ident_ = symbol_ || '_';
  global_ident___ = symbol___ || '___';
  previous_global_val_ = GLOBAL[global_ident_];
  previous_global_val___  = GLOBAL[global_ident___];
  GLOBAL[global_ident_] = _;
  GLOBAL[global_ident___] = ___;
};



// Install default global purry identifiers by default.
// This assumes almost all purry users will want the _ and ___
// 'syntax' and want it globally. If true, and this author belives
// it is, it follows that opt-out is better than opt-in.
// purry.noConflict may always undo this.
purry.install('_', '___');



// Private Helpers

function clone_array(array){
  var clone = [];
  var count = array.length;
  i = 0;
  while(i < count) {
    clone.push(array[i]);
    i++;
  }
  return clone;
}