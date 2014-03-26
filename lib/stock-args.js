'use strict';

var lu = require('./utils/prelude'),
    clone_array = lu.clone_array;
var debug = require('./debug');
var errors = require('./errors');
var syntax = require('./syntax'),
    _ = syntax.tokens._,
    ___ = syntax.tokens.___;



/*  Purry a function that has a fixed number of parameters.
 *
 *  @signature
 *  * a; [*] b; Int c, d, e ::
 *  (*... -> a), b, c, d, e -> a || purry
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

  function purry_wrapper(){
    debug.history(f, arguments);
    debug.history_r(f, _params, _psize, _phead, _ptail, _phead);

    var arguments_size = arguments.length;

    debug.start(f);

    /* If invoked without arguents we simply return the wrapper,
    UNLESS primed in which case we should fire.
    Delayed execution makes primed a potential case here.*/
    if (!arguments_size) {
      debug.end(f);
      return _psize ? purry_wrapper : f.apply(null, _params)  ;

    /* If we DID receive arguments but ARE primed
    throw an error. This is contentious. We could
    choose to fire while silently ignoring the
    arguments, but this encourages ambiguity.*/
    } else if (_psize === 0 && !(arguments[0] === ___ && arguments_size === 1)) {
      throw errors.too_many_args(f, arguments, _params);
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
    params' FIRST HOLE, ii can be
    advanced beyond such "first hole" via arguments
    that are holes or right-pins. right-pins will move
    ii sync to ptail whereas holes
    will simply unsync it from whichever side its on,
    phead or ptail. 'ii' abbreviates 'instance_index'.*/
    var ii = phead;

    /* We need a flag to track if phead/ptail and ii
    are synced (previously mentioned how ii
    may advance beyond them). With this information we
    can update phead/ptail correctly. Once an unsync
    occurs we know that phead/ptail cannot change
    for this instance.*/
    var ii_synced = true;

    /* We want a flag that tells us when our index
    cannot continue being useful anymore. In a looping
    context this makes possible various optimizations.*/
    var ii_reached_end = false;

    /* We want flags to know if we saw special purry "syntax"
    These flags help enforce correct usage such as preventing
    use of pin twice, etc.*/
    var had_holes = false, had_pin = false;

    /* TODO: annotate */
    var trailing_holes = 0, trailing_holes_l = 0;

    /* Variables purely for the argument processing loop.
    We need a __temp var for the ugly business of swapping
    sync of ii from phead to ptail upon
    a right-pin.*/
    var __temp, arg, i = 0, inc = 1, loopend = arguments_size;

    for(; i!==loopend; i+=inc) {
      arg = arguments[i];
      debug.history_r(f, params, psize, phead, ptail, ii);
      debug.loop(f, i, arguments_size, arg);

      // Switch to processing right-pinned args.
      if (arg === ___) {
        if (inc === -1) throw errors.too_many_pins(arguments);
        // TODO doc
        trailing_holes_l = trailing_holes;
        trailing_holes = 0;
        // Flags
        ii_synced = true;
        had_pin = true;
        // Param indexes
        // Careful, order of next 4 assignments matter.
        __temp = phead;
        phead = ptail;
        ptail = __temp;
        ii = phead;
        // Arg indexes
        inc = -1;
        // Careful, order of next 2 assignments matter.
        loopend = i;
        i = arguments_size;
      }


      /* If we have already ii_reached_end
      then continuing will overshoot either-or phead, ptail.
      An error should be thrown so that the user can fix
      this bug (if not bug, then being more careful with
      inovcation, e.g. in a functor context). */
      else if (ii_reached_end) {
        throw errors.too_many_args(f, arguments, _params);
      }

      // Stock something

      /* Holes have no affect on the params-state. Because they have
      an affect on delay-state we cannot ignore them even if we have
      overshot head or tail.*/
      else if (arg === _) {
        had_holes = true;
        trailing_holes++;
        ii_synced = false;
        if (ii === ptail) {
          ii_reached_end = true;
        } else {
          ii = seek(inc, params, ii, ptail);
        }

      } else {
        trailing_holes = 0;
        params[ii] = arg;
        psize--;

        /* If phead/ptail are equal, and we just
        added an argument, it MUST mean that that
        we're primed. Nothing left to do but we don't
        short-circut (instead just flag end) because
        we can catch some ambigous errors for
        the user if further iteration occur.
        e.g. we're sworn to throw errors if the user uses
        more than 1 pin.*/
        if (phead === ptail) {
          ii_reached_end = true;
        }

        /* Handle case of ii reaching opposing end
        because of holes, and arguing param there thus
        necessitating an update of said opposing end.
        We can safely infer that ii_reached_end
        is now true since ii reached its limit
        on this iteration.*/
        else if (ii === ptail) {
          ptail = seek(inc * -1, params, ptail, phead);
          ii_reached_end = true;

        // Find the next hole
        } else {
          /* If an argument falls out of bounds, discard it.
          Also discard everything after, because all subsequent
          arguments will be out of bounds too.*/
          ii = seek(inc, params, ii, ptail);

          /* If applicable sync phead to ii.
          See flag comments above for details.*/
          if (ii_synced) phead = ii;
        }
      }
    }
    /* TODO annotate.*/
    var real_arguments_size = had_pin ? arguments_size - 1 : arguments_size;

    // TODO: We can tell the user if the incomplete
    //       holes are left or right and even show
    //       ^ under each incomplete hole.
    /* If holes were used without a pin and
    arguments_size was less than param count
    then its ambiguous if the user was to
    lazy to use a pin, or actually thinks
    the function takes less arguments than
    it really does. Throw an error.*/
    if (trailing_holes && real_arguments_size < _psize){
      throw errors.incomplete_holes(arguments, _psize);
    }

    /* Reswap phead/ptail if they were swapped
    during argument processing.*/
    if (inc === -1) {
      __temp = phead;
      phead = ptail;
      ptail = __temp;
    }


    debug.end(f);

    /* Holes or a pin signal delay in execution
    (Afterall, they are just partial application
    exposed with fancy syntax).*/
    return had_pin || had_holes || psize ?
      stock_args(f, params, psize, phead, ptail) :
      f.apply(null, params) ;
  }
  // purry_wrapper.purry_history = f.purry_history;
  return purry_wrapper;
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