/* globals _, ___ */
'use strict';
var Benchmark = require('benchmark');
var curry = require('lodash').curry;
var partial = require('lodash').partial;
var partialRight = require('lodash').partialRight;
var purry = require('../');
purry.install();
var echo_args = function(a, b, c, d, e, f){
  return [a, b, c, d, e, f];
};
var echo_vargs = function(){
  return arguments;
};
var curried = curry(echo_args);
var purried = purry(echo_args);
var curried_vargs = curry(echo_vargs);
var purried_vargs = purry(echo_vargs);

var maxTime = Number(process.argv[2]) || 10;



var suite_results = [];

Benchmark.Suite()

.add('native', function() {
  echo_args(1,2,3,4,5,6);
}, {maxTime:maxTime})

.add('curry', function() {
  curried(1,2,3,4,5,6);
}, {maxTime:maxTime})
.add('purry', function() {
  purried(1,2,3,4,5,6);
}, {maxTime:maxTime})

.add('curry_vargs', function() {
  curried_vargs(1,2,3,4,5,6);
}, {maxTime:maxTime})
.add('purry_vargs', function() {
  purried_vargs(1,2,3,4,5,6);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_results.push(String(event.target));
})

.on('complete', function() {
  console.log('Execution with all arguments at once:');
  suite_results.forEach(function(x){ console.log(x); });
  console.log('\nFastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});






var suite_curries_results = [];

Benchmark.Suite()

.add('curry', function() {
  curried(1)(2)(3)(4)(5)(6);
}, {maxTime:maxTime})

.add('purry', function() {
  purried(1)(2)(3)(4)(5)(6);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_curries_results.push(String(event.target));
})

.on('complete', function() {
  console.log('Curring:');
  suite_curries_results.forEach(function(x){ console.log(x); });
  console.log('\nFastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});






var suite_partial_results = [];

Benchmark.Suite()

.add('L partial_args', function() {
  partial(partial(partial(partial(partial(partial(echo_args, 1), 2), 3), 4), 5), 6)();
}, {maxTime:maxTime})
.add('L purry_args', function() {
  purried(1,___)(2,___)(3,___)(4,___)(5,___)(6,___)();
}, {maxTime:maxTime})


.add('L partial_vargs', function() {
  partial(partial(partial(partial(partial(partial(echo_vargs, 1), 2), 3), 4), 5), 6)();
}, {maxTime:maxTime})
.add('L purry_vargs', function() {
  purried_vargs(1,___)(2,___)(3,___)(4,___)(5,___)(6,___)();
}, {maxTime:maxTime})

.add('R partial_args', function() {
  partialRight(partialRight(partialRight(partialRight(partialRight(partialRight(echo_args, 6), 5), 4), 3), 2), 1)();
}, {maxTime:maxTime})
.add('R purry_args', function() {
  purried(___,6)(___,5)(___,4)(___,3)(___,2)(___,1)();
}, {maxTime:maxTime})

.add('R partial_vargs', function() {
  partialRight(partialRight(partialRight(partialRight(partialRight(partialRight(echo_vargs, 6), 5), 4), 3), 2), 1)();
}, {maxTime:maxTime})
.add('R purry_vargs', function() {
  purried_vargs(___,6)(___,5)(___,4)(___,3)(___,2)(___,1)();
}, {maxTime:maxTime})

.add('some-R partial_args', function() {
  partial(echo_args, 1, 2, 3)(4, 5, 6);
}, {maxTime:maxTime})
.add('some-R purry_args', function() {
  purried(1,2,3,___)(4,5,6);
}, {maxTime:maxTime})

.add('some-R partial_vargs', function() {
  partial(echo_vargs, 1, 2, 3)(4, 5, 6);
}, {maxTime:maxTime})
.add('some-R purry_vargs', function() {
  purried_vargs(1,2,3,___)(4,5,6);
}, {maxTime:maxTime})


.add('L/R partial_args', function() {
  partialRight(partial(echo_args, 1, 2, 3), 4, 5, 6)();
}, {maxTime:maxTime})
.add('L/R purry_args', function() {
  purried(1,2,3,___)(___,4,5,6)();
}, {maxTime:maxTime})

.add('L/R partial_vargs', function() {
  partialRight(partial(echo_vargs, 1, 2, 3), 4, 5, 6)();
}, {maxTime:maxTime})
.add('L/R purry_vargs', function() {
  purried_vargs(1,2,3,___)(___,4,5,6)();
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_partial_results.push(String(event.target));
})

.on('complete', function() {
  console.log('Partial Application:');
  suite_partial_results.forEach(function(x){ console.log(x); });
  console.log('\nFastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});






var suite_exec_results = [];

var a1 = partialRight(partial(echo_args, 1, 2, 3), 5, 6);
var b1 = purried(1,2,3,___)(___,5,6);
var c1 = partialRight(partial(echo_vargs, 1, 2, 3), 5, 6);
var d1 = purried_vargs(1,2,3,___)(___,5,6);

var a2 = partial(partial(partial(partial(partial(echo_args, 1), 2), 3), 4), 5);
var b2 = purried(1,___)(2,___)(3,___)(4,___)(5,___);
var c2 = partial(partial(partial(partial(partial(echo_vargs, 1), 2), 3), 4), 5);
var d2 = purried_vargs(1,___)(2,___)(3,___)(4,___)(5,___);

Benchmark.Suite()

.add('L/R partial_args', function() {
  a1(6);
}, {maxTime:maxTime})

.add('L/R purry_args', function() {
  b1(6);
}, {maxTime:maxTime})

.add('L/R partial_vargs', function() {
  c1(6);
}, {maxTime:maxTime})

.add('L/R purry_vargs', function() {
  d1(6);
}, {maxTime:maxTime})

.add('L partial_args', function() {
  a2(6);
}, {maxTime:maxTime})

.add('L purry_args', function() {
  b2(4);
}, {maxTime:maxTime})

.add('L partial_vargs', function() {
  c2(4);
}, {maxTime:maxTime})

.add('L purry_vargs', function() {
  d2(4);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_exec_results.push(String(event.target));
})

.on('complete', function() {
  console.log('Execution:');
  suite_exec_results.forEach(function(x){ console.log(x); });
  console.log('\nFastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});






var holey_results = [];

Benchmark.Suite()
.add('L/R partial_args', function() {
  partialRight(partial(echo_args, 1,2,3),4,5,6)();
}, {maxTime:maxTime})
.add('L/R purry_args', function() {
  purried(1,2,3,___)(___,4,5,6)();
}, {maxTime:maxTime})

.add('L/R partial_vargs', function() {
  partialRight(partial(echo_vargs, 1,2,3),4,5,6)();
}, {maxTime:maxTime})
.add('L/R purry_vargs', function() {
  purried_vargs(1,2,3,___)(___,4,5,6)();
}, {maxTime:maxTime})

.add('1@1 purry_args', function() {
  purried(_,2,3,___)(___,1,4,5,6)();
}, {maxTime:maxTime})
.add('1@1 purry_vargs', function() {
  purried_vargs(_,2,3,___)(___,1,4,5,6)();
}, {maxTime:maxTime})


.add('1@2 purry_args', function() {
  purried(1,_,3,___)(___,2,4,5,6)();
}, {maxTime:maxTime})
.add('1@2 purry_vargs', function() {
  purried_vargs(1,_,3,___)(___,2,4,5,6)();
}, {maxTime:maxTime})

.add('1@2,3 2@4,6 purry_args', function() {
  purried(1,_,3,___)(___,4,_,6)(2,5);
}, {maxTime:maxTime})
.add('1@2,3 2@4,6 purry_vargs', function() {
  purried_vargs(1,_,3,___)(___,4,_,6)(2,5);
}, {maxTime:maxTime})

.add('All L holes purry_args', function() {
  purried(1,_,_,_,_,_)(2,_,_,_,_)(3,_,_,_)(4,_,_)(5,_)(6);
}, {maxTime:maxTime})
.add('All L holes purry_vargs', function() {
  purried_vargs(1,_,_,_,_,_)(2,_,_,_,_)(3,_,_,_)(4,_,_)(5,_)(6);
}, {maxTime:maxTime})
.add('All R holes purry_args', function() {
  purried(_,_,_,_,_,6)(_,_,_,_,5)(_,_,_,4)(_,_,3)(_,2)(1);
}, {maxTime:maxTime})
.add('All R holes purry_vargs', function() {
  purried_vargs(_,_,_,_,_,6)(_,_,_,_,5)(_,_,_,4)(_,_,3)(_,2)(1);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  holey_results.push(String(event.target));
})

.on('complete', function() {
  console.log('Holey Partial Application:');
  holey_results.forEach(function(x){ console.log(x); });
  console.log('\nFastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});