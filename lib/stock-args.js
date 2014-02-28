'use strict';
var clone_array = require('./clone-array');
var debug = require('./debug');
var errors = require('./errors');
var syntax = require('./syntax');
var _ = syntax.hole.value,
    ___ = syntax.pin.value;



/*  Purry a function that has a fixed number of parameters.
 *
 *  @signature
 *  a *; b, c, d Int:  (* -> a), b, c, d -> a || purry
 *
 *  @param f
 *  The function to purry.
 *
 *  @param _params
 *  f's stocked arguments. Initially an array of holes
 *  it is filled with actual arguments as f (or rather its wrapper
 *  technically) is invoked. After sufficient argumentation this
 *  *is* f's final arguments.
 *
 *  @param _psize
 *  The number of unargued parameters.
 *
 *  @param _phead
 *  An index pointing at the first _params hole.
 *
 *  @param _ptail
 *  An index pointing at the last _params hole.
 *
*/
function stock_args(f, _params, _psize, _phead, _ptail){

  // if (!f.purry_history) f.purry_history = [];

  function intercept_arguments(){
    var arguments_size = arguments.length;

    // debug.start(arguments);
    // debug.state(_params, _psize, _phead, _ptail, _phead);

    /* If invoked without arguents we simply return the wrapper,
    UNLESS primed in which case we should fire.
    Delayed execution makes primed a potential case here.*/
    if (!arguments_size) {
      // debug.end(false, _psize);
      // debug.bar();
      // f.purry_history = f.purry_history.concat([{
      //   params:_params,
      //   args: Array.prototype.slice.call(arguments, 0)
      // }]);
      return _psize ? intercept_arguments : f.apply(null, _params)  ;

    /* If we DID receive arguments but ARE primed
    throw an error. This is contentious. We could
    choose to fire while silently ignoring the
    arguments, but this encourages ambiguity.*/
    } else if (_psize === 0) {
      throw errors.too_many_args(arguments, params);
    }

    // Cloning and Shadowing for this instance
    var params = clone_array(_params);
    var psize = _psize;
    var phead = _phead;
    var ptail = _ptail;

    /* A variable to track the param we're on
    throughout this instance. It is different
    than the phead beacuse due to instnace holes
    and right-pins it actually can advance further than
    phead, but unlike phead it is instance-specific
    meaning its state is not passed to the
    next instance iteration.*/
    var instance_index = phead;
    var instance_index_reached_end = false;
    /* Create a flag to track if phead and instance_index
    are synced. They are always synced but two events can unsync
    them: Any instance holes will unsync them; A right-pin
    could sync or unsync them depending on how the right-pin arguemnts
    decend upon the params. */
    var is_mark_synced = true;
    var is_delayed_execution = false;
    var had_holes = false;
    var had_pin = false;
    var phead_swap_temp;

    // Variables purely for the argument processing loop.
    var argument, i = 0, inc = 1, loopend = arguments_size;

    for(; i!==loopend; i+=inc) {
      argument = arguments[i];
      // debug.loop(i, arguments_size, argument);
      // debug.state(params, psize, phead, ptail, instance_index);

      // Switch to processing right-pinned arguments.
      if (argument === ___) {
        if (inc === -1) throw errors.pins_error(arguments);
        // Flags
        instance_index_reached_end = false;
        is_mark_synced = true;
        is_delayed_execution = true;
        had_pin = true;
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


      /* If we have already instance_index_reached_end
      then to continue would overshot either-or phead, ptail.
      An error should be thrown so that the user can fix
      this bug (or perhaps its just a matter of being less careless
      with inovcation in a e.g. functor). */
      else if (instance_index_reached_end) {
        throw errors.too_many_args(arguments, _params);
      }

      // Stock something

      /* Holes have no affect on the params-state. Because they have
      an affect on delay-state we cannot ignore them even if we have
      overshot head or tail.*/
      else if (argument === _) {
        had_holes = true;
        is_delayed_execution = true;
        is_mark_synced = false;
        if (instance_index === ptail) {
          instance_index_reached_end = true;
        } else {
          instance_index = seek(inc, params, instance_index, ptail);
        }

      } else {
        params[instance_index] = argument;
        psize--;

        // If arguing the last param then short-circuit
        if (phead === ptail) {
          instance_index_reached_end = true;
        }

        /* Handle case of instance_index reaching opposing end
        because of holes, and arguing param there thus
        necessitating an update of said opposing end.
        We can safely infer that instance_index_reached_end
        is now true since instance_index reached its limit
        on this iteration.*/
        else if (instance_index === ptail) {
          ptail = seek(inc * -1, params, ptail, phead);
          instance_index_reached_end = true;

        // Find the next hole
        } else {
          /* If an argument falls out of bounds, discard it.
          Also discard everything after, because all subsequent
          arguments will be out of bounds too.*/
          instance_index = seek(inc, params, instance_index, ptail);

          /* If applicable sync phead to instance_index.
          See flag comments above for details.*/
          if (is_mark_synced) phead = instance_index;
        }
      }
    }

    /* If holes were used without a pin and
    arg count was less than param count
    then its ambiguous if the user was to
    lazy to use a pin, or actually thinks
    the function takes less arguments than
    it really does. Throw an error.*/
    if (had_holes && arguments_size < _psize && !had_pin){
      throw errors.incomplete_holes(arguments, _psize);
    }

    /* Reswap head/tail if they were swapped
    during argument processing.*/
    if (inc === -1) {
      phead_swap_temp = phead;
      phead = ptail;
      ptail = phead_swap_temp;
    }


    // debug.end(is_delayed_execution, psize);
    // debug.state(params, psize, phead, ptail, instance_index);
    // debug.bar();

    // f.purry_history = f.purry_history.concat([{
    //   params:params,
    //   args: Array.prototype.slice.call(arguments, 0)
    //  }]);
    return is_delayed_execution || psize ?
      stock_args(f, params, psize, phead, ptail) :
      f.apply(null, params) ;
  }
  // intercept_arguments.purry_history = f.purry_history;
  return intercept_arguments;
}



// Domain Helpers

function seek(inc, params, index, end){
  if (index !== end) {
    do { index += inc; }
    while (index !== end && params[index] !== _);
  }
  return index;
}



module.exports = stock_args;