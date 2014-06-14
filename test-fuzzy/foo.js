/*global _, ___*/

process.on('uncaughtException', function(err){
  console.log(err.stack);
});

var p = require('../install');

var a = p(function(accumulator, index, collection){ return [accumulator, index, collection]; });

console.log(a(_))
// p(function(){ return arguments; });
// a(___, _, 5, _);
// a(5, _, _, ___);
// a(_, ___, 5, _);
// a(___, ___, ___);
// a(_);
// a(1, 2, 3, 4, _);
// a(1,2,3,___)(_);
// a(1,2,3,___)(_, ___);
