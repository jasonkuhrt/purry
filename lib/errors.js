'use strict';

var inspct = require('./introspect');
var error = require('./utils/error');
var p = require('./utils/prosoldis');
var tt = require('./utils/terminal-text');



exports.too_many_pins = Purry_Error(too_many_pins);
exports.too_many_args = Purry_Error(too_many_args);
exports.incomplete_holes = Purry_Error(trailing_holes);
exports.no_vargs_support = Purry_Error(no_vargs_support);
exports.trailing_holes = Purry_Error(trailing_holes);



function too_many_pins(args){
  return {
    problem: ('Given arguments '+ inspct.format_invocation(args) +
    ' contain '+ inspct.count_pins(args) +' pins but only 1 is allowed per invocation.'
    ),
    solution: plural('Remove %n pin%s.', inspct.count_pins(args) - 1),
    code: 'purry_too_many_pins',
  };
}



function too_many_args(f, args, fparams_now){
  var params = inspct.get_free_params(f, fparams_now);
  var rem_count = args.length - params.length;

  return {
    code: 'purry_too_many_args',
    problem: ( 'Too many arguments. '+
      params.length +' parameter function given '+
      args.length +' argument'+ plural_s(args.length) +'.\n'+
      '\n'+
      'Params: '+ params.join(', ') +'\n'+
      'Args  : '+ inspct.format_arguments(args) +'\n'
    ),
    solution: plural('Remove %n argument%s.', rem_count)
  };
}



function trailing_holes(args, trail_count){
  return {
    code: 'purry_trailing_holes',
    problem: plural('Given arguments '+ inspct.format_invocation(args) +' contain %n trailing hole%s. Trailing holes are useless.',
    trail_count),
    solution: plural('Remove %n trailing hole%s.', trail_count)
  };
}




function no_vargs_support(){
  return {
    code: 'purry_no_vargs_support',
    problem: 'The purried function is variable-parameter, which is not currently supported.',
    solution: 'Do not purry functions having variable params. Purry determines this as any function with .length === 0.'
  };
}






// Private

function Purry_Error(err_obj){
  function do_purry_error(){
    var o = err_obj.apply(null, arguments);
    o.message = 'Purry:\n\n'+ tt.stack_pos(p(o));
    var err = error(o);
    if (Error.captureStackTrace) Error.captureStackTrace(err, do_purry_error);
    error.discard_callsite(err, /purry_wrapper/);
    return err;
  }
  return do_purry_error;
}

function plural(sentence, num){
  return sentence.replace(/%n/, num).replace(/%s/, plural_s(num));
}

function plural_s(count){
  return count === 1 ? '' : 's' ;
}