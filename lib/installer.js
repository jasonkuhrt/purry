/* global window */
'use strict';




function Installer(ctx, defaults){
  defaults = defaults || {};
  var previous = {};

  function install(mappings){
    mappings = mappings || defaults;
    for (var key in mappings) {
      if (mappings.hasOwnProperty(key)) {
        previous[key] = ctx[key];
        ctx[key] = mappings[key];
      }
    }
  }

  function uninstall(){
    for (var key in previous) {
      if (previous.hasOwnProperty(key)) {
        ctx[key] = previous[key];
      }
    }
  }

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