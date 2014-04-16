'use strict';

var util = require('util'),
    inspect = util.inspect;
var funargs = require('args-list');
var lu = require('./utils/prelude'),
    to_array = lu.to_array,
    space = lu.space;
var getCallerSource = require('./utils/get-caller-source').bind(null, 3, 6);
var error = require('./utils/error');
var purry_error = require('./purry-error');
var syntax = require('./syntax');
var color = require('ansicolors');



function too_many_pins(args){
  function probPointer(code){
    return color.red(colPointer(lastIndexOf(syntax.tokens.___), code));
  }
  var source = getCallerSource();
  var problemIndex = lastIndexOf(syntax.tokens.___)(source.line);
  if (!!~problemIndex) {
    source.lines.splice(6, 0, probPointer(source.line));
  }
  var msg = pmsg(
    util.format('A purried function can only have\n'+
                '1 pin per invocation, but you had %d.\n'+
                '\n'+
                'Given args:  (%s)\n'+
                '              %s',
                countPins(args),
                to_array(args).join(', '),
                probPointer(to_array(args).join(', '))
    ),
    util.format('Remove %d pin(s).', countPins(args) - 1),
    source,
    source.render()
  );
  var err = error.syntax(msg);
  err.code = 'purry_too_many_pins';
  return err;
}



function too_many_args(f, args, params){
  var param_idents = funargs(f).filter(function(x, i){ return params[i] === '_'; });
  var msg = pmsg(
    util.format('Arguments outnumber parameters.\n'+
                'The function has %s parameters but\n'+
                'you gave it %d arguments.\n'+
                '\n'+
                'Params: %s\n'+
                'Args  : %s\n',
                param_idents.length,
                args.length,
                param_idents.join(', '),
                to_array(args).join(', ')
    ),
    util.format('Remove %d arguments.', args.length - param_idents.length),
    getCallerSource(),
    getCallerSource().render()
  );
  var err =  error(msg);
  err.code = 'purry_too_many_args';
  return err;
}


function incomplete_holes(args, params_size){
  var msg = pmsg(
    util.format('Holes used but too few arguments given\n'+
                '(expected %d but got %d %s). ',
                params_size,
                args.length,
                inspect(to_array(args), {depth:0})
    ),
    'Argue all parameters or use a pin.',
    getCallerSource(),
    getCallerSource().render()
  );
  var err = error.syntax(msg);
  err.code = 'purry_incomplete_holes';
  return err;
}



// Domain Helpers

// function format_params(params){
//   var na_msg = params.length ?
//       format('N/A (function is primed with %d arguments)', params.length) :
//       format('N/A (function is vargs or maybe not take any arguments?') ;
//   return only_holes(params).join(', ') || na_msg;
// }

// function only_holes(params){
//   return params.filter(function(x){ return x === syntax.tokens._; });
// }

var lastIndexOf = function lastIndexOf(thing){
  return function(inStr){
    return inStr.lastIndexOf(thing);
  };
};

function countPins(args){
  return to_array(args).filter(function(x){ return x === syntax.tokens.___; }).length;
}

function colPointer(f, str){
  return space(f(str)) + '^';
}

function prob_sol_code(prob, sol, source, snippet){
  // var titles = ['Problem', 'Solution', 'Source Code'];
  var sections = [];
  sections.push(col(16, 'Problem:', prob));
  sections.push(col(16, 'Solution:', sol));
  var fileinfo = source.basename + ' ' + color.black('@ '+ source.dirname);
  sections.push(col(16, 'Source Code:', fileinfo));
  sections.push(snippet);
  var str = sections.join('\n\n');
  return str;
}

function col(col1_size, title, txt){
  return title + txt.split('\n')
              .map(function(line, i){
                var spaces = space(i === 0 ? col1_size - title.length : col1_size);
                return  spaces + line ;
              })
              .join('\n');
}


function pmsg(){
  return 'Purry\n\n'+ stack_pos(prob_sol_code.apply(null, arguments));
}

function stack_pos(txt){
  return indent(4, txt) + '\n\n';
}

function indent(size, txt){
  return txt.split('\n').map(function(line){
    return space(size) + line;
  }).join('\n');
}





exports.too_many_pins = purry_error(too_many_pins);
exports.too_many_args = purry_error(too_many_args);
exports.incomplete_holes = purry_error(incomplete_holes);
exports.no_vargs_support = function(){
  return error('Sorry, Purry does not currently support variable parameter functions.');
};