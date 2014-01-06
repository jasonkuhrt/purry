var assert = require('assert');
var lo = require('lodash');
var apply = function(xs, f){
  return f.apply(null, xs);
};
var apply0 = function(f){
  return f();
};
var apply1 = function(x, f){
  return f(x);
};
var flip2 = function(f){
  return function(x, y){ return f(y, x); };
};
var add64 = function(x){
  return x + 64;
};
var chunk_grow1 = function(array){
  if (array.length === 0) return [];
  if (array.length === 1) return [array];
  var from = 0;
  var take = 1;
  var takei = from + take;
  var chunks = [];
  while (takei < array.length) {
    takei = from + take;
    chunks.push(array.slice(from, takei));
    from = takei;
    take++;
  };
  return chunks;
}
var from_char_code = String.fromCharCode;
var to_argument_names = lo.partialRight(lo.map, lo.compose(from_char_code, add64));







module.exports = function(curry){
  var values = [1,2,3,4,5,6];
  var is_result = lo.partial(assert.deepEqual, values)
  var echo = new Function(to_argument_names(values).join(','), 'return Array.prototype.slice.apply(arguments);');
  var f = curry(echo);


  describe('currying', function(){

    // Implied rules:
    // - executes immediately after all parameters have been argued

    it('Works with 1-parameter functions', function(){
      assert.equal(1, curry(function(x){ return x; })(1));
    });

    it('may accept arguments all at once (like "normal")', function(){
      is_result(apply(values, f));
    });

    it('may accept arguments one at a time', function(){
      is_result(values.reduce(flip2(apply1), f));
    });

    it('may accept arguments multiple at a time', function(){
      is_result(chunk_grow1(values).reduce(flip2(apply), f));
    });

    it('may accept no arguments, which causes function to return as-is', function(){
      var do_reduce = function(f, x){ return apply1(x, apply0(f)); };
      is_result(values.reduce(do_reduce, f));
    });

  });
};