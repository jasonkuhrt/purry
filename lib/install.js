'use strict';

var syntax = require('./syntax');
var globe = require('plat').GLOBE;

module.exports = function PLUGIN(purry){

  function install(custom_idents){
    custom_idents = custom_idents || {};

    syntax.hole.ident_custom = custom_idents._ || null;
    syntax.pin.ident_custom = custom_idents.___ || null;

    var hole_ident = custom_idents._ || syntax.hole.ident;
    var pin_ident = custom_idents.___ || syntax.pin.ident;

    globe[hole_ident] = syntax.hole.val;
    globe[pin_ident] = syntax.pin.val;

    return purry;
  }

  install[syntax.hole.ident] = syntax.hole.val;
  install[syntax.pin.ident] = syntax.pin.val;

  return install;
};