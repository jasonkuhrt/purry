var ___ = '___send-to-shoulder___';
var _ = '_hole_';
var log = 1 ? console.log : function(){} ;


var purry = module.exports = function(f){
  if (f.length === 0) throw new Error('purry is not compatible with variable-argument functions.')
  var initial_stock = [];
  var i = f.length;
  while(i > 0){
    initial_stock.push(_);
    i--;
  }
  return accumulate_arguments(f, f.length, 0, initial_stock, 0, f.length - 1, false);
};


// @f –– The wrapped function
// @capacity –– The param count of f
// @_capacity_used –– The remaining holes of _stock
// @_stock –– The plugged holes so far
// @_stock_i_min –– The minimum index to start stocking at.
function accumulate_arguments(f, capacity, _capacity_used, _stock, _stock_i_min, _stock_i_max, _f_has_holes){
  return function(){
    var arguments_count = arguments.length;

    // Bail ASAP if no arguments given
    if (!arguments_count) {
      return capacity === _capacity_used ?
        f.apply(null, _stock) :
        accumulate_arguments(f, capacity, _capacity_used, _stock, _stock_i_min, _stock_i_max, _f_has_holes) ;

    }

    // TODO? Bail ASAP if all arguments given in single shot
    // if (!_capacity_used && arguments_count === capacity)

    // index for various loops below
    var i;

    // log('\n\nInvoked: capacity %d | instance capacity %d | stock %j | new args %j', capacity, capacity - _capacity_used, _stock, arguments)

    // Cloning, to avoid clobbering
    var stock = [];
    var _stock_count = _stock.length;
    i = 0;
    while(i < _stock_count) {
      stock[i] = _stock[i]; i++;
    }

    // Shadowing, to avoid clobbering
    var capacity_used = _capacity_used;
    var stock_i_min = _stock_i_min;
    var stock_i_max = _stock_i_max;
    var f_has_holes = _f_has_holes;

    var is_delayed_execution = false;
    var argument;
    var stock_i = stock_i_min;
    var incby = 1;
    var endloop = arguments_count;
    var limit = stock_i_max + 1;
    process_new_arguments:
    for(i = 0; i !== endloop; i += incby) {
      // log('\nend condition: %d !== %d | stock_i: %d', i, endloop, stock_i);
      argument = arguments[i];

      if (argument === _) {
        is_delayed_execution = true;
        if (i + incby === endloop) break;
        f_has_holes = true;
        stock_i += incby
        // log('Hit Hole _, offset @ %d');
        continue;
      }

      if (argument === ___) {
        is_delayed_execution = true;
        if (i + incby === endloop) break;
        incby = -1;
        stock_i = stock_i_max;
        limit = stock_i_min - 1;
        // log('Hit shoulder ___ of size (%d)', (arguments_count - (i + 1)));
        endloop = i;
        i = arguments_count;
        continue;
      }

      if (f_has_holes) {
        while (stock[stock_i] !== _) {
          if (stock_i === limit) break process_new_arguments;
          stock_i += incby;
        }
      }

      // log('Add argument: %j @ i%d', argument, stock_i);
      stock[stock_i] = argument;
      // log('stock: %j', stock);
      if (stock_i_min === stock_i) stock_i_min++;
      if (stock_i_max === stock_i) stock_i_max--;
      capacity_used++;
      stock_i += incby;
    }


    // log('\nProcessing Complete. ')
    // log('Not applicable, stock: %j', stock);
    // log('Applicable! %j', stock);
    return is_delayed_execution || capacity !== capacity_used ?
      accumulate_arguments(f, capacity, capacity_used, stock, stock_i_min, stock_i_max, f_has_holes) :
      f.apply(null, stock) ;
  };
}

purry._ = _;
purry.___ = ___;

purry.install = function(symbol_, symbol___){
  purry.installSyntax(symbol_, symbol___);
  Function.prototype.purry = purry;
};

purry.installSyntax = function(symbol_, symbol___){
  GLOBAL[symbol_ || '_'] = _;
  GLOBAL[symbol___ || '___'] = ___;
};