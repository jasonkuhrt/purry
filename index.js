'use strict';
var lu = require('./lib/utils/prelude'),
    augment = lu.augment,
    array_of = lu.array_of;
var installer = require('./lib/utils/installer');
var errors = require('./lib/errors');
var syntax = require('./lib/syntax');
var stock_args = require('./lib/stock-args');



function purry(f){
  var psize = f.length;
  if (psize) {
    return stock_args(f, array_of(psize, syntax.tokens._), psize, 0, psize-1);
  } else {
     throw errors.no_vargs_support();
  }
}



// Setup syntax global installion.

var globalBootstrapper = installer.global(syntax.tokens);

purry.install = function installPurry(mappings){
  globalBootstrapper.install(mappings);
  return purry;
};

purry.uninstall = function uninstallPurry(){
  globalBootstrapper.uninstall();
  return purry;
};



// Setup token access to support local installation.

augment(syntax.tokens);



module.exports = purry;