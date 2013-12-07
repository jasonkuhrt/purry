var Benchmark = require('benchmark');
var curry = require('lodash').curry;
var purry = require('../');



var suite = new Benchmark.Suite;

var echo_arguments = function(a, b, c, d, e, f, g){
  return [a, b, c, d, e, f, g];
};

var echo_arguments_curried = curry(echo_arguments);
var echo_arguments_purried = purry(echo_arguments);
var maxTime = 0.1;

// add tests
suite.add('echo_arguments', function() {
  echo_arguments(1,2,3,4,5,6,7);
}, {maxTime:maxTime})

.add('echo_arguments_curried', function() {
  echo_arguments_curried(1,2,3,4,5,6,7);
}, {maxTime:maxTime})

.add('echo_arguments_purried', function() {
  echo_arguments_purried(1,2,3,4,5,6,7);
}, {maxTime:maxTime})

// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
// run async
.run({ async: true});