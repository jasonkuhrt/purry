/* global window */
'use strict';
var augment = require('./augment');



function Installer(ctx, defaults){
  defaults = defaults || {};
  var previous = {};

  function install(mappings){
    mappings = mappings || defaults;
    augment.withBackup(ctx, mappings, previous);
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