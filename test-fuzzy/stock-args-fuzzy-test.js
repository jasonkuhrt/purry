var lo = require('lodash'),
    isFunction = lo.isFunction,
    isEmpty = lo.isEmpty,
    range = lo.range;
var K = require('./lib/util').create_fixed_echo;
var gen_invocation = require('./lib/generate-args');
var format = require('./lib/format');
var splat = function(f, args){ return f.apply(null, args); };


var k8 = K(8);

// Create an arguments seed.
// This seed's size must match k's param count.
var pool = range(1,9);
// We need to take 0 or more arguments from the pool
//

function run(f, pool, history){
  if (isEmpty(pool) && isFunction(f)) return {result:f(), history:history};
  if (isEmpty(pool)) return {result:f, history:history};
  var invocation = gen_invocation(pool);
  var result = splat(f,invocation.args);
  var history_ = history.concat([{pool:pool, args:invocation.args, debug:result.purry_history || result}]);
  return isFunction(result) ?
    run(result, invocation.args_pool, history_) :
    {result:result, history:history_} ;
}

var r = run(k8, pool, []);

console.log(format.create_report(r));

// console.log('invocation round seed', pool);
// console.log('invocation round construction', invocation);
// console.log('invocation round result', splat(k8, invocation.args).purry_history);