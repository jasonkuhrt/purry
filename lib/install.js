'use strict';

var syntax = require('./syntax');
var globe = require('plat').GLOBE;

console.log(globe);

module.exports = function PLUGIN(purry){

  function install(custom_idents){
    var hole_ident = (custom_idents && custom_idents._) || syntax.hole.ident;
    var pin_ident = (custom_idents && custom_idents.___) || syntax.pin.ident;
    globe[hole_ident] = syntax.hole.val;
    globe[pin_ident] = syntax.pin.val;
    return purry;
  }

  install[syntax.hole.ident] = syntax.hole.val;
  install[syntax.pin.ident] = syntax.pin.val;

  return install;
};