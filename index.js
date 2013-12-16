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
    return accumulate_arguments(f, f.length, initial_stock, 0, 0, f.length - 1, f.length - 1, 0, 0);
  } else {
    return accumulate_variable_arguments(f, [], false, [], false, 0, 0);
  }
};



function accumulate_variable_arguments(f, _stock_left, _is_stock_left_holey, _stock_right, _is_stock_right_holey, _l_stock_i_min, _r_stock_i_min){
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



function accumulate_arguments(f, _remaining, _stock, _l_stock_i_min, _l_stock_i_max_next, _r_stock_i_min, _r_stock_i_max_next, _hole_count, _r_hole_count){
  return function intercept_arguments(){
    var arguments_count = arguments.length;

    // Bail if no arguments given
    if (!arguments_count) {
      return _remaining ? intercept_arguments : f.apply(null, _stock)  ;
    }

    // console.log('\n\n\n\nSTART (%s)', format_arguments(arguments));
    // console.log('     _remaining: %d  | _l_stock_i_min: %d  | _l_stock_i_max_next: %d  | _r_stock_i_min: %d  | _r_stock_i_max_next: %d  | _hole_count: %d  | _r_hole_count: %d  | _stock: %j', _remaining, _l_stock_i_min, _l_stock_i_max_next, _r_stock_i_min, _r_stock_i_max_next, _hole_count, _r_hole_count, _stock);

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
      // console.log('\nLOOP %d/%d: %s', i+1, endloop, format_argument(argument));
      // console.log(' INIT remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);

      if (argument === _) {
        is_delayed_execution = true;
        // If _ is last argument it has no affect
        // other than delaying execution.
        if (i + 1 === endloop) break;
        if (stock_i === l_stock_i_max_next) {
          // console.log('  Match instance hole to never-seen stock param');
          buffered_hole_count++;
          stock_i++;
        } else {
          // console.log('  Match instance hole to already-seen stock hole');
          hole_count_instance--;
          if (!hole_count_instance) stock_i = l_stock_i_max_next;
        }
        // console.log('  FIN remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock_i: %d  |  stock: %j', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock_i, stock);
        continue;
      }

      if (argument === ___) {
        is_delayed_execution = true;
        if (i + 1 === endloop) { i++; break; }
        has_right_shoulder = true;
        hole_count_instance = r_hole_count;
        stock_i = r_stock_i_min;
        stock_i_limit = l_stock_i_min - 1;
        endloop = i;
        i = arguments_count - 1;
        // console.log('  EXT remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  | stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);
        break;
      }

      hole_count += buffered_hole_count ;
      buffered_hole_count = 0;
      // console.log('  BUF remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);

      // TODO break, really? Or continue? If we break but have an unread _ or ___ then we miss noting that this is a delayed invocation?...
      if (stock_i === stock_i_limit) break;

      if (hole_count_instance) {
        while (stock[stock_i] !== _) {
          // If an argument falls out of bounds, discard it.
          // Also discard everything after, because all subsequent
          // arguments will be out of bounds too.
          if (stock_i === stock_i_limit) {
            // console.log('  EXT stock_i (%d) reached stock_i_limit (%d)', stock_i, stock_i_limit);
            break process_l_arguments;
          }
          stock_i++;
        }
        // console.log('  Match instance arg (%d) to already-seen hole (%d)', argument, stock_i);
        hole_count--;
        hole_count_instance--;
        stock[stock_i] = argument;
        if (!hole_count) {
          // console.log('  All stock holes are argued!');
          stock_i = l_stock_i_min = l_stock_i_max_next
        } else if (!hole_count_instance){
          // console.log('  All instance holes are argued!');
          stock_i = l_stock_i_max_next;
        } else {
          // console.log('  instance holes remain...');
          stock_i++;
        }
      } else {
        stock[stock_i] = argument;
        if (stock_i === l_stock_i_min) l_stock_i_min++;
        stock_i++;
      }

      if (stock_i > l_stock_i_max_next) l_stock_i_max_next = stock_i;
      remaining--;
      // console.log('  FIN remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);
    }

    if (has_right_shoulder) {
      // console.log('\nPROCESS R ARGUMENTS');
      // Don't need to handle:
      // - delayed execution tracking
      //   since being in this loop implies being delayed
      // - right-shoulder
      //   since only 1 is allowed (TODO) per instnace
      process_r_arguments:
      for (; i > endloop; i--) {
        argument = arguments[i];
        // console.log('\nLOOP %d/%d: %s', i - 1, endloop, format_argument(argument));
        // console.log(' INIT remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);
        if (argument === _) {
          if (i - 1 === endloop) {
            break;
          } else if (stock_i === r_stock_i_max_next) {
            // console.log('  Match instance hole to never-seen stock param');
            buffered_hole_count++;
            stock_i--;
          } else {
            // console.log('  Match instance hole to already-seen stock hole');
            hole_count_instance--;
            if (!hole_count_instance) stock_i = r_stock_i_max_next ;
          }
          // console.log('  FIN remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock_i: %d  |  stock: %j', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock_i, stock);
          continue;
        }

        r_hole_count += buffered_hole_count;
        buffered_hole_count = 0;
        // console.log('  BUF remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);

        // TODO break, really? Or continue? If we break but have an unread _ or ___ then we miss noting that this is a delayed invocation?...
        if (stock_i === stock_i_limit) break;

        if (hole_count_instance) {
          while (stock[stock_i] !== _) {
            // If an argument falls out of bounds, discard it.
            // Also discard everything after, because all subsequent
            // arguments will be out of bounds too.
            if (stock_i === stock_i_limit) {
              // console.log('  EXT stock_i (%d) reached stock_i_limit (%d)', stock_i, stock_i_limit);
              break process_r_arguments;
            }
            stock_i--;
          }
          // console.log('  Match instance arg (%d) to already-seen hole (%d)', argument, stock_i);
          r_hole_count--;
          hole_count_instance--;
          stock[stock_i] = argument;
          if (!r_hole_count) {
            // console.log('  All stock holes are argued!');
            stock_i = r_stock_i_min = r_stock_i_max_next ;
          } else if (!hole_count_instance){
            // console.log('  All instance holes are argued!');
            stock_i = r_stock_i_max_next ;
          } else {
            // console.log('  instance holes remain...');
            stock_i--;
          }
        } else {
          stock[stock_i] = argument;
          if (stock_i === r_stock_i_min) r_stock_i_min--;
          stock_i--;
        }

        if (stock_i < r_stock_i_max_next) r_stock_i_max_next = stock_i;
        remaining--;
        // console.log('  FIN remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j  |  stock_i: %d', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock, stock_i);
      }
    }

    // console.log('\nEND\n      remaining: %d  |  l_stock_i_min: %d  |  l_stock_i_max_next: %d  |  r_stock_i_min: %d  |  r_stock_i_max_next: %d  |  hole_count: %d  |  r_hole_count: %d  |  stock: %j', remaining, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count, stock);
    return is_delayed_execution || remaining ?
      accumulate_arguments(f, remaining, stock, l_stock_i_min, l_stock_i_max_next, r_stock_i_min, r_stock_i_max_next, hole_count, r_hole_count) :
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

function format_argument(arg){
  if (arg === _) return '_';
  if (arg === ___) return '___';
  return arg;
}

function format_arguments(args){
  return Array.prototype.slice.apply(args).map(format_argument).join(', ');
}