'use strict';
var array_of = require('./lib/array-of');
var stock_args = require('./lib/stock-args');
var syntax = require('./lib/syntax');
var errors = require('./lib/errors');
var Installer = require('./lib/installer');



function purry(f){
  var psize = f.length;
  if (psize) {
    return stock_args(f, array_of(psize, _), psize, 0, psize-1);
  } else {
     throw errors.no_vargs_support();
  }
}

purry._ = syntax.pin.value;

purry.___ = syntax.hole.value;



// Setup syntax installion commands.

var installation = Installer.global(syntax.lookup);

purry.installSyntax = installation.install;

purry.noConflict = installation.uninstall;

purry.install = function(mappings){
  purry.installSyntax(mappings);
  // TODO Expose purry on function prototype.
  // Function.prototype.purry = purry;
};

// Install default global purry identifiers by default.
// This assumes almost all purry users will want the default
// 'syntax' and want it globally. If true, and this author belives
// it is, it follows that opt-out is better than opt-in.
// purry.noConflict may always undo this.
purry.install(syntax.lookup);



module.exports = purry;