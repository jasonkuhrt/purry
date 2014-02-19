'use strict';
var assert = require('assert');
var lo = require('lodash'),
    curry = lo.curry;



assert.throws = curry(function(assertion, f){
  var did_throw = false;
  try { f(); }
  catch (err) { did_throw = true; assertion(err); }
  finally { assert(did_throw, 'Expected an error to be thrown but none was.'); }
});


assert.throws_too_many_args = assert.throws(function(err){
  return (/You argued too many.*/).test(err.message);
});


assert.throws_pin = assert.throws(function(err){
  return (/You cannot use.*/).test(err.message);
});


assert.throws_too_few_args = assert.throws(function(err){
  return (/Incomplete arguments.*/).test(err.message);
});