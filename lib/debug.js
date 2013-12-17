var syntax = require('./syntax');
var to_array = Array.prototype.slice;



exports.start = function start(args){
  console.log('\n\n\n\nSTART (%s)', format_arguments(args));
};

exports.state_vargs = function state(){
  var format = ['l_stock: %j', 'l_holey: %j', 'l_min: %d', 'r_stock: %j', 'r_holey: %j', 'r_min: %d'].join('  |  ');
  var log_args = [format].concat(to_array.apply(arguments));
  console.log.apply(console, log_args);
}

function format_argument(arg){
  if (arg === syntax.hole.value) return syntax.hole.symbol;
  if (arg === syntax.pin.value) return syntax.pin.symbol;
  return arg;
}

function format_arguments(args){
  return Array.prototype.slice.apply(args).map(format_argument).join(', ');
}