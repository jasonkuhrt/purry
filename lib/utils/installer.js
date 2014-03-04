/* global window */
'use strict';
var lu = require('./prelude'),
    augment = lu.augment,
    augment_with_backup = lu.augment_with_backup;



function Installer(ctx, defaults){
  defaults = defaults || {};
  var previous = {};

  function install(mappings){
    mappings = mappings || defaults;
    augment_with_backup(ctx, mappings, previous);
  }

  var uninstall = augment.bind(null, ctx, previous);

  return {
    install: install,
    uninstall: uninstall
  };
}


Installer.global = function globalInstaller(defaults){
  return Installer(globalReference(), defaults);
};



function globalReference(){
  return (typeof window !== 'undefined' && window) ||
  GLOBAL;
}



module.exports = Installer;