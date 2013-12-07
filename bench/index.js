var Benchmark = require('benchmark');
var curry = require('lodash').curry;
var purry = require('../');
var echo_arguments = function(a, b, c, d, e, f, g){
  return [a, b, c, d, e, f, g];
};
var echo_arguments_curried = curry(echo_arguments);
var echo_arguments_purried = purry(echo_arguments);

var maxTime = Number(process.argv[2]) || 10;



var suite = Benchmark.Suite('All arguments at once');
var suite_results = [];

suite.add('echo_arguments', function() {
  echo_arguments(1,2,3,4,5,6,7);
}, {maxTime:maxTime})

.add('echo_arguments_curried', function() {
  echo_arguments_curried(1,2,3,4,5,6,7);
}, {maxTime:maxTime})

.add('echo_arguments_purried', function() {
  echo_arguments_purried(1,2,3,4,5,6,7);
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
  echo_arguments_curried(1)(2)(3)(4)(5)(6)(7);
}, {maxTime:maxTime})

.add('echo_arguments_purried', function() {
  echo_arguments_purried(1)(2)(3)(4)(5)(6)(7);
}, {maxTime:maxTime})

.on('cycle', function(event) {
  suite_curries_results.push(String(event.target));
})
.on('complete', function() {
  suite_curries_results.forEach(function(x){ console.log(x); });
  console.log('Fastest is %s\n\n', this.filter('fastest').pluck('name'));
})

.run({ async: true});