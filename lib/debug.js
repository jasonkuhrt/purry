var syntax = require('./syntax');
var to_array = Array.prototype.slice;



exports.start = function(args){
  console.log('\n\n\n\nSTART (%s)', format_arguments(args));
};

exports.early_exit_no_real_args = function(args){
  console.log('EXT EARLY < No real args < %s', format_arguments(args));
};

exports.early_exit_no_args = function(args){
  console.log('EXT EARLY < No args < %s', format_arguments(args));
};

exports.state_vargs = function(){
  var format = ['l_stock: %j', 'l_holey: %j', 'l_min: %d', 'r_stock: %j', 'r_holey: %j', 'r_min: %d'].join('  |  ');
  var log_args = [format].concat(to_array.apply(arguments));
  console.log.apply(console, log_args);
}

exports.loop = function(i, end, arg){
  console.log('\nLOOP %d/%d: %s', i+1, end, format_argument(arg));
};

exports.loop_state_vargs = function(){
  var format = ['stock_i: %d', 'stock_i_limit: %d', 'is_holey: %j', 'stock: %j'].join('  |  ');
  var log_args = [format].concat(to_array.apply(arguments));
  console.log.apply(console, log_args);
};



exports.format_argument = format_argument;
exports.format_arguments = format_arguments;

function format_argument(arg){
  if (arg === syntax.hole.value) return syntax.hole.symbol;
  if (arg === syntax.pin.value) return syntax.pin.symbol;
  return arg;
}

function format_arguments(args){
  return '(' + Array.prototype.slice.apply(args).map(format_argument).join(', ') + ')';
}