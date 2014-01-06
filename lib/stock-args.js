var clone_array = require('./clone-array');
var debug = require('./debug');
var errors = require('./errors');
var syntax = require('./syntax');
var _ = syntax.hole.value,
    ___ = syntax.pin.value;



module.exports = function stock_args(f, _params, _psize, _phead, _ptail){
  return function intercept_arguments(){
    var arguments_size = arguments.length;

    // debug.start(arguments);
    // debug.state(_psize, _params, _phead, _ptail, _phead);

    // Bail if no arguments given. Either we apply the wrapped function
    // if all params are argued or return the wrapper.
    if (!arguments_size) {
      // debug.end(false, _psize);
      return _psize ? intercept_arguments : f.apply(null, _params)  ;
    }

    // Cloning and Shadowing for this instance
    var params = clone_array(_params);
    var psize = _psize;
    var phead = _phead;
    var ptail = _ptail;

    // A variable to track the param we're on
    // throughout this instance. It is different
    // than the phead beacuse due to instnace holes
    // and right-pins it actually can advance further than
    // phead, but unlike phead it is instance-specific
    // meaning its state is not passed to the
    // next instance iteration.
    var instance_index = phead;
    var instance_index_reached_end = false;
    // Create a flag to track if phead and instance_index
    // are synced. They are always synced but two events can unsync
    // them: Any instance holes will unsync them; A right-pin
    // could sync or unsync them depending on how the right-pin arguemnts
    // decend upon the params.
    var is_mark_synced = true;
    var is_delayed_execution = false;
    var phead_swap_temp;

    // Variables purely for the argument processing loop.
    var argument, i = 0, inc = 1, loopend = arguments_size;


    process_arguments:
    for(; i!==loopend; i+=inc) {
      argument = arguments[i];
      // debug.loop(i, arguments_size, argument);
      // debug.state(psize, params, phead, ptail, instance_index);


      // Switch to processing right-pinned arguments
      if (argument === ___) {
        if (inc === -1) throw errors.pins_error();
        // Flags
        instance_index_reached_end = false;
        is_mark_synced = true;
        is_delayed_execution = true;
        // Param indexes
        phead_swap_temp = phead;
        phead = ptail;
        ptail = phead_swap_temp;
        instance_index = phead;
        // Arg indexes
        inc = -1;
        loopend = i;
        i = arguments_size;
      }


      // Stock something

      // Holes have no affect on the params-state. Because they have
      // an affect on delay-state we cannot ignore them even if we have
      // overshot head or tail.
      else if (argument === _) {
        is_delayed_execution = true;
        is_mark_synced = false;
        if (instance_index_reached_end || instance_index === ptail) {
          instance_index_reached_end = true;
        } else {
          instance_index = seek(inc, params, instance_index, ptail);
        }

      // If we have not overshot head or tail update the params with
      // the new arg.
      } else if (!instance_index_reached_end) {
        params[instance_index] = argument;
        psize--;

        // If arguing the last param then short-circuit
        if (phead === ptail) {
          instance_index_reached_end = true;
        }

        // Handle case of instance_index reaching opposing end
        // because of holes, and arguing param there thus
        // necessitating an update of said opposing end.
        // We can safely infer that instance_index_reached_end
        // is now true since instance_index reached its limit
        // on this iteration.
        else if (instance_index === ptail) {
          ptail = seek(inc * -1, params, ptail, phead);
          instance_index_reached_end = true;

        // Find the next hole
        } else {
          // If an argument falls out of bounds, discard it.
          // Also discard everything after, because all subsequent
          // arguments will be out of bounds too.
          instance_index = seek(inc, params, instance_index, ptail);

          // If applicable sync phead to instance_index.
          // See flag comments above for details.
          if (is_mark_synced) phead = instance_index;
        }
      }
    }

    // Reswap head/tail if they were swapped
    // during argument processing.
    if (inc === -1) {
      phead_swap_temp = phead;
      phead = ptail;
      ptail = phead_swap_temp;
    }


    // debug.end(is_delayed_execution, psize);
    // debug.state(psize, params, phead, ptail, instance_index);
    // debug.log('===================================================================================================');

    return is_delayed_execution || psize ?
      stock_args(f, params, psize, phead, ptail) :
      f.apply(null, params) ;
  };
}









// Private Helpers

function seek(inc, params, index, end){
  if (index !== end) {
    do { index += inc; } while (index !== end && params[index] !== _);
  }
  return index;
}

function clone_params(array, less_than, greater_than, else_value){
  var clone = [];
  var count = array.length;
  var i = 0;
  while(i < count) {
    clone.push(i < less_than || i > greater_than ? array[i] : else_value);
    i++;
  }
  return clone;
}