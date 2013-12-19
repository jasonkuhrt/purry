var stock_vargs = require('./lib/stock-vargs');
var stock_args = require('./lib/stock-args');
var syntax = require('./lib/syntax');
var ___ = syntax.pin.value;
var _ = syntax.hole.value;


var purry = module.exports = function(f){
  if (f.length) {
    var initial_stock = [];
    var i = f.length;
    while(i > 0){
      initial_stock.push(_);
      i--;
    }
    return stock_args(f, f.length, initial_stock, 0, 0, f.length - 1, f.length - 1, 0, 0);
  } else {
    return stock_vargs(f, [], 0, 0, [], 0, 0);
  }
};





purry._ = _;
purry.___ = ___;

var previous_global_val_;
var previous_global_val___;
var global_ident_;
var global_ident___;

// Install global identifiers for hole and shoulder.
purry.install = function(symbol_, symbol___){
  purry.installSyntax(symbol_, symbol___);
  // TODO Expose purry on function prototype.
  // Function.prototype.purry = purry;
};

// Uninstall global identifiers for hole and shoulder.
// Restore those identifiers to whatever they were prior.
purry.noConflict = function(){
  GLOBAL[global_ident_] = previous_global_val_;
  GLOBAL[global_ident___] = previous_global_val___;
};

// Install global identifiers for hole and shoulder.
purry.installSyntax = function(symbol_, symbol___){
  global_ident_ = symbol_ || '_';
  global_ident___ = symbol___ || '___';
  previous_global_val_ = GLOBAL[global_ident_];
  previous_global_val___  = GLOBAL[global_ident___];
  GLOBAL[global_ident_] = _;
  GLOBAL[global_ident___] = ___;
};



// Install default global purry identifiers by default.
// This assumes almost all purry users will want the default
// 'syntax' and want it globally. If true, and this author belives
// it is, it follows that opt-out is better than opt-in.
// purry.noConflict may always undo this.
purry.install(syntax.hole.symbol, syntax.pin.symbol);