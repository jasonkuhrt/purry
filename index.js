/*
plug
partial:
shoulder:
hole:
value:
lh  : left-hand
rh  : right-hand
oh  : opposite-hand (means right in lha, left in rha)
ohh : opsite-hand holes
lhh : left-hand hole
rhh : right-hand hole
lha : left-hand args
rha : right-hand args

Anatomy:

[lha][rha]
  |    |
  ------
  [size]
    |
  (...)->
*/

var ___ = '___send-to-shoulder___';
var _ = '_hole_';


var purry = module.exports = function(f){
  if (f.length === 0) throw new Error('purry is not compatible with variable-argument functions.')
  return (function accumulate_arguments(_lsa, _rsa, stock_capacity, _stock_capacity_used){
    return function(/* ...args_new_raw */){
      var args_new_count = arguments.length;
      var args_new_raw = Array.prototype.slice.apply(arguments);

      if (is_no_curry_no_partial_case(stock_capacity, _stock_capacity_used, args_new_raw)){
        return f.apply(null, args_new_raw);
      }

      // One-time shoulder clones so instances don't clobber each other.
      // Each instance, here on, mutates the shoulders for performance gain
      // Instances *never* mutate the lha/rha **values** thus we do not need to worry about "deep cloning"
      var lsa = shallow_clone(_lsa);
      var rsa = shallow_clone(_rsa);
      var stock_capacity_used = _stock_capacity_used;

      if (args_new_count) {
        var delivery = format_delivery(args_new_raw, stock_capacity - _stock_capacity_used);
        // TODO optimize by calling in the if condition below
        if (delivery[0]) {
          stock_capacity_used += delivery[0];
          if (delivery[1]) apply_args(lsa, delivery[2]);
          if (delivery[3]) apply_args(rsa, delivery[4]);
        }
      }


      return delivered_partial(args_new_raw) || stock_capacity - stock_capacity_used ?
        accumulate_arguments(lsa, rsa, stock_capacity, stock_capacity_used) :
        f.apply(null, resolve_arg_storage(lsa, rsa)) ;
    };
  }({}, {}, f.length, 0));
};

purry._ = _;
purry.___ = ___;



// Helpers