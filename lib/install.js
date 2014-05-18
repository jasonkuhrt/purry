'use strict';

var syntax = require('./syntax');
var global_scope = require('./utils/global-scope');



module.exports = function PLUGIN(purry){

  function install(custom_idents){
    var hole_ident = (custom_idents && custom_idents._) || syntax.hole.ident;
    var pin_ident = (custom_idents && custom_idents.___) || syntax.pin.ident;
    global_scope[hole_ident] = syntax.hole.val;
    global_scope[pin_ident] = syntax.pin.val;
    return purry;
  }

  install[syntax.hole.ident] = syntax.hole.val;
  install[syntax.pin.ident] = syntax.pin.val;

  return install;
};