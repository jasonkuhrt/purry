'use strict';
var Installer = require('./lib/installer');
var array_of = require('./lib/array-of');
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

var globalBootstrapper = Installer.global(syntax.lookup);

purry.install = function installPurry(mappings){
  globalBootstrapper.install(mappings);
  return purry;
};

purry.uninstall = function uninstallPurry(){
  globalBootstrapper.uninstall();
  return purry;
};



module.exports = purry;