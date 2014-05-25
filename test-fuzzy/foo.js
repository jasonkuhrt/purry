/*global _, ___*/
'use strict';

process.on('uncaughtException', function(err){
  console.log(err.stack);
});

var p = require('../install');

var a = p(function(accumulator, index, collection){ return [accumulator, index, collection]; });

// p(function(){ return arguments; });
a(___, ___, ___);
a(_);
a(1, 2, 3, 4, _);
// a(1,2,3,___)(_);
// a(1,2,3,___)(_, ___);
