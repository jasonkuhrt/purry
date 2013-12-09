var ___ = '___send-to-shoulder___';
var _ = '_hole_';
//var log = 1 ? console.log : function(){} ;


var purry = module.exports = function(f){
  if (f.length === 0) throw new Error('purry is not compatible with variable-argument functions.')
  var initial_stock = [];
  var i = f.length;
  while(i > 0){
    initial_stock.push(_);
    i--;
  }
  return (function accumulate_arguments(capacity, _capacity_used, _stock){
    return function(/* ...args_new */){
      var arguments_count = arguments.length;

      // Bail ASAP if no arguments given
      if (!arguments_count) {
        return capacity - _capacity_used ?
          accumulate_arguments(capacity, _capacity_used, _stock) :
          f.apply(null, _stock) ;
      }
      // index for various loops below
      var i;
      // TODO optimization case: 0 arguments_count
      // TODO optimization case: capacity === _capacity_used
      //log('\n\nInvoked: capacity %d | instance capacity %d | stock %j | new args %j', capacity, capacity - _capacity_used, _stock, args_new.map(function(x){ return x === _ ? '_' : x === ___ ? '___' : x ; }))

      // Clone stock, to avoid clobbering
      var stock = [];
      var _stock_count = _stock.length;
      i = 0;
      for (; i < _stock_count; i++ ) {
        stock[i] = _stock[i];
      }

      // Shadow capacity_used, to avoid clobbering
      var capacity_used = _capacity_used;

      // enter new arguments into instance
      var is_args_partial = false;
      var arg_new;
      var stock_i = 0;
      var incby = 1;
      var endloop = arguments_count;
      var offset = 0;
      i = 0;
      process_new_arguments:
      for (; i !== endloop; i += incby) {
        //if (stock_i >= (capacity || i < 0) break;
        // TODO needed? if (capacity === capacity_used) break;
        //log('\nend condition: %d !== %d | stock_i: %d', i, endloop, stock_i);
        arg_new = arguments[i];

        if (arg_new === _) {
          is_args_partial = true;
          offset++;
          //log('Hit Hole _, offset @ %d', offset);
          continue;
        }

        if (arg_new === ___) {
          is_args_partial = true;
          incby = -1
          stock_i = capacity - 1;
          //log('Hit shoulder ___ of size (%d)', (arguments_count - (i + 1)));
          endloop = i;
          i = arguments_count;
          continue
        }

        while (true) {
          if (stock_i >= capacity) break process_new_arguments;
          if (stock[stock_i] !== _) {
            stock_i += incby;
          } else if(offset) {
            stock_i += incby;
            offset--;
          } else {
            break;
          }
        }
        //log('Add argument: %j @ i%d', arg_new, stock_i);
        stock[stock_i] = arg_new;
        //log('stock: %j', stock);
        capacity_used++;
      }



      //log('\nProcessing Complete. ')
      if (is_args_partial || capacity - capacity_used) {
        //log('Not applicable, stock: %j', stock);
        return accumulate_arguments(capacity, capacity_used, stock);
      } else {
        //log('Applicable! %j', stock);
        return f.apply(null, stock);
      }
    };
  }(f.length, 0, initial_stock));
};

purry._ = _;
purry.___ = ___;