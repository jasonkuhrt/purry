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
var curried = curry(echo_arguments);
var purried = purry(echo_arguments);

var maxTime = Number(process.argv[2]) || 10;



var suite = Benchmark.Suite();
var suite_results = [];

suite.add('all args at once: function', function() {
  echo_arguments(1,2,3,4,5,6);
}, {maxTime:maxTime})

.add('all args at once: curry', function() {
  curried(1,2,3,4,5,6);
}, {maxTime:maxTime})

.add('all args at once: purry', function() {
  purried(1,2,3,4,5,6);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_results.push(String(event.target));
})

.on('complete', function() {
  console.log('Calling:');
  suite_results.forEach(function(x){ console.log(x); });
  console.log('Fastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});



var suite_curries = Benchmark.Suite();
var suite_curries_results = [];

suite_curries.add('curried', function() {
  curried(1)(2)(3)(4)(5)(6);
}, {maxTime:maxTime})

.add('purried', function() {
  purried(1)(2)(3)(4)(5)(6);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_curries_results.push(String(event.target));
})

.on('complete', function() {
  console.log('Curring:');
  suite_curries_results.forEach(function(x){ console.log(x); });
  console.log('Fastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});



var suite_partial = Benchmark.Suite();
var suite_partial_results = [];

suite_partial

.add('partial(echo_arguments)', function() {
  partial(partial(partial(partial(partial(partial(echo_arguments, 1), 2), 3), 4), 5), 6)();
}, {maxTime:maxTime})

.add('purried(x,___)(...)', function() {
  purried(1,___)(2,___)(3,___)(4,___)(5,___)(6,___)();
}, {maxTime:maxTime})

.add('partialRight(echo_arguments)', function() {
  partialRight(partialRight(partialRight(partialRight(partialRight(partialRight(echo_arguments, 6), 5), 4), 3), 2), 1)();
}, {maxTime:maxTime})

.add('purried(___,x)(...)', function() {
  purried(___,6)(___,5)(___,4)(___,3)(___,2)(___,1)();
}, {maxTime:maxTime})

.add('partial(echo_arguments) (some)', function() {
  partial(echo_arguments, 1, 2, 3)(4, 5, 6);
}, {maxTime:maxTime})

.add('purried(x,...,___)(...)', function() {
  purried(1,2,3,___)(4,5,6);
}, {maxTime:maxTime})


.add('partialRight(echo_arguments) mixed with partial', function() {
  partialRight(partial(echo_arguments, 1, 2, 3), 5, 6)(4);
}, {maxTime:maxTime})

.add('purried left-and-right', function() {
  purried(1,2,3,___)(___,5,6)(4);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_partial_results.push(String(event.target));
})

.on('complete', function() {
  console.log('Partial Application:');
  suite_partial_results.forEach(function(x){ console.log(x); });
  console.log('Fastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});



var suite_exec = Benchmark.Suite();
var suite_exec_results = [];

var a1 = partialRight(partial(echo_arguments, 1, 2, 3), 5, 6);
var a2 = partial(partial(partial(partial(partial(partial(echo_arguments, 1), 2), 3), 4), 5), 6);
var b1 = purried(1,2,3,___)(___,5,6);
var b2 = purried(1,___)(2,___)(3,___)(4,___)(5,___)(6,___);

suite_exec

.add('partial(echo_arguments)', function() {
  a2();
}, {maxTime:maxTime})

.add('purried(x,___)(...)', function() {
  b2();
}, {maxTime:maxTime})

.add('partialRight(echo_arguments) mixed with partial', function() {
  a1(4);
}, {maxTime:maxTime})

.add('purried left-and-right', function() {
  b1(4);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_exec_results.push(String(event.target));
})

.on('complete', function() {
  console.log('Execution:');
  suite_exec_results.forEach(function(x){ console.log(x); });
  console.log('Fastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});