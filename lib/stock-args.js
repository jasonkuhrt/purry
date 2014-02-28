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
    } else if (_psize === 0 && !(arguments[0] === ___ && arguments_size === 1)) {
      throw errors.too_many_args(arguments, _params);
    }

    /* Clone params so that we can add new arguments
    to it without affecting other instances.*/
    var params = clone_array(_params);

    /* Shadow purry state to encapsulate this
    instance from all others. If we don't, and this
    stock_args has been invoked > 1, the instances
    will affect one another's _psize/_phead/_ptail.*/
    var psize = _psize;
    var phead = _phead;
    var ptail = _ptail;

    /* We need an index tracking the current param
    DURING THIS INSTANCE. It always begins at phead
    but has a different purpose. Whereas
    phead ONLY advances in accordance with
    params' FIRST HOLE, instance_index can be
    advanced beyond such "first hole" via arguments
    that are holes or right-pins. right-pins will move
    instance_index sync to ptail whereas holes
    will simply unsync it from whichever side its on,
    phead or ptail.*/
    var instance_index = phead;

    /* We need a flag to track if phead/ptail and instance_index
    are synced (previously mentioned how instance_index
    may advance beyond them). With this information we
    can update phead/ptail correctly. Once an unsync
    occurs we know that phead/ptail cannot change
    for this instance.*/
    var instance_index_synced = true;

    /* We want a flag that tells us when our index
    cannot continue being useful anymore. In a looping
    context this makes possible various optimizations.*/
    var instance_index_reached_end = false;

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
        instance_index_synced = true;
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
        instance_index_synced = false;
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
          if (instance_index_synced) phead = instance_index;
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


    // debug.end(had_pin || had_holes, psize);
    // debug.state(params, psize, phead, ptail, instance_index);
    // debug.bar();

    // f.purry_history = f.purry_history.concat([{
    //   params:params,
    //   args: Array.prototype.slice.call(arguments, 0)
    //  }]);

    /* Holes or a pin signal delay in execution
    (Afterall, they are just partial application
    exposed with fancy syntax).*/
    return had_pin || had_holes || psize ?
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