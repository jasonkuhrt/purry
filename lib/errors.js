'use strict';

var putils = require('./meta-utils');
var error = require('./utils/error');
var p = require('./utils/prosoldis');
var tt = require('./utils/terminal-text');



exports.too_many_pins = Purry_Error(too_many_pins);
exports.too_many_args = Purry_Error(too_many_args);
exports.incomplete_holes = Purry_Error(incomplete_holes);
exports.no_vargs_support = Purry_Error(no_vargs_support);



function too_many_pins(args){
  return {
    problem: ('Given arguments '+ putils.format_invocation(args) +
    ' contain '+ putils.count_pins(args) +' pins but only 1 is allowed per invocation.'
    ),
    solution: plural('Remove %n pin%s.', putils.count_pins(args) - 1),
    code: 'purry_too_many_pins',
  };
}



function too_many_args(f, args, fparams_now){
  var params = putils.get_free_params(f, fparams_now);
  var rem_count = args.length - params.length;

  return {
    code: 'purry_too_many_args',
    problem: ( 'Too many arguments. '+
      params.length +' parameter function given '+
      args.length +' argument'+ plural_s(args.length) +'.\n'+
      '\n'+
      'Params: '+ params.join(', ') +'\n'+
      'Args  : '+ putils.format_arguments(args) +'\n'
    ),
    solution: plural('Remove %n argument%s.', rem_count)
  };
}



function incomplete_holes(args, params_size){
  return {
    code: 'purry_incomplete_holes',
    problem: ('Given arguments '+ putils.format_invocation(args) +' contain unpinned holes but arg count '+
     'is less than param count of '+ params_size +'.'
    ),
    solution: plural('Pin your holes, or argue %n more parameter%s, or do not use holes.', params_size - args.length)
  };
}



function no_vargs_support(){
  return {
    code: 'purry_no_vargs_support',
    problem: 'The purried function is variable-parameter, which is not currently supported.',
    solution: 'Do not purry functions having variable params. Purry determines this as any function with .length === 0.'
  };
}






// Domain Helpers
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