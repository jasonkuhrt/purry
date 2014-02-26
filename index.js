'use strict';
var Installer = require('./lib/installer');
var array_of = require('./lib/array-of');
var augment = require('./lib/augment');
var errors = require('./lib/errors');
var syntax = require('./lib/syntax'),
    _ = syntax.hole.value;
var stock_args = require('./lib/stock-args');



function purry(f){
  var psize = f.length;
  if (psize) {
    return stock_args(f, array_of(psize, _), psize, 0, psize-1);
  } else {
     throw errors.no_vargs_support();
  }
}

// Setup syntax installion commands.

augment(purry, Installer.global(syntax.lookup));

// Install default global purry identifiers.
// This assumes almost all purry users will want
// the default idents globally. If true, and this
// author belives it is, then opt-out trumps opt-in.
// .uninstall() can always undo this.
purry.install(syntax.lookup);




module.exports = purry;