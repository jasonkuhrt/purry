var Benchmark = require('benchmark');
var curry = require('lodash').curry;
var partial = require('lodash').partial;
var partialRight = require('lodash').partialRight;
var purry = require('../');
var ___ = purry.___;
var __ = purry.__;
var echo_arguments = function(a, b, c, d, e, f){
  return [a, b, c, d, e, f];
};
var echo_arguments_curried = curry(echo_arguments);
var echo_arguments_purried = purry(echo_arguments);

var maxTime = Number(process.argv[2]) || 10;



var suite = Benchmark.Suite('All arguments at once');
var suite_results = [];

suite.add('echo_arguments', function() {
  echo_arguments(1,2,3,4,5,6);
}, {maxTime:maxTime})

.add('echo_arguments_curried', function() {
  echo_arguments_curried(1,2,3,4,5,6);
}, {maxTime:maxTime})

.add('echo_arguments_purried', function() {
  echo_arguments_purried(1,2,3,4,5,6);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_results.push(String(event.target));
})

.on('complete', function() {
  suite_results.forEach(function(x){ console.log(x); });
  console.log('Fastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});



var suite_curries = Benchmark.Suite('Arguments added incrementally');
var suite_curries_results = [];

suite_curries.add('echo_arguments_curried', function() {
  echo_arguments_curried(1)(2)(3)(4)(5)(6);
}, {maxTime:maxTime})

.add('echo_arguments_purried', function() {
  echo_arguments_purried(1)(2)(3)(4)(5)(6);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_curries_results.push(String(event.target));
})

.on('complete', function() {
  suite_curries_results.forEach(function(x){ console.log(x); });
  console.log('Fastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});



var suite_partial = Benchmark.Suite('partial application');
var suite_partial_results = [];

suite_partial

.add('partial(echo_arguments)', function() {
  partial(partial(partial(partial(partial(partial(echo_arguments, 1), 2), 3), 4), 5), 6)();
}, {maxTime:maxTime})

.add('echo_arguments_purried(x,___)(...)', function() {
  echo_arguments_purried(1,___)(2,___)(3,___)(4,___)(5,___)(6,___)();
}, {maxTime:maxTime})

.add('partialRight(echo_arguments)', function() {
  partialRight(partialRight(partialRight(partialRight(partialRight(partialRight(echo_arguments, 6), 5), 4), 3), 2), 1)();
}, {maxTime:maxTime})

.add('echo_arguments_purried(___,x)(...)', function() {
  echo_arguments_purried(___,6)(___,5)(___,4)(___,3)(___,2)(___,1)();
}, {maxTime:maxTime})

.add('partial(echo_arguments) (some)', function() {
  partial(echo_arguments, 1, 2, 3)(4, 5, 6);
}, {maxTime:maxTime})

.add('echo_arguments_purried(x,...,___)(...)', function() {
  echo_arguments_purried(1,2,3,___)(4,5,6);
}, {maxTime:maxTime})


.add('partialRight(echo_arguments) mixed with partial', function() {
  partialRight(partial(echo_arguments, 1, 2, 3), 5, 6)(4);
}, {maxTime:maxTime})

.add('echo_arguments_purried left-and-right', function() {
  echo_arguments_purried(1,2,3,___)(___,5,6)(4);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_partial_results.push(String(event.target));
})

.on('complete', function() {
  suite_partial_results.forEach(function(x){ console.log(x); });
  console.log('Fastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});