'use strict';

var pe = require('./lib/utils/prelude'),
    array_of = pe.array_of;
var algo_fixed = require('./lib/algo-fixed');
var syntax = require('./lib/syntax');



module.exports = purryAuto;

purryAuto.purryAuto = purryAuto;
purryAuto.purryVar = purryVar;
purryAuto.purryFix = purryFix;

purryAuto.purry1 = function purry1(f){ return purryFix(1, f); };
purryAuto.purry2 = function purry2(f){ return purryFix(2, f); };
purryAuto.purry3 = function purry3(f){ return purryFix(3, f); };
purryAuto.purry4 = function purry4(f){ return purryFix(4, f); };
purryAuto.purry5 = function purry5(f){ return purryFix(5, f); };

purryAuto.install = require('./lib/install')(purryAuto);



function purryAuto(f, psize){
  return psize    ? purryFix(psize, f) :
         f.length ? purryFix(f.length, f) :
         purryVar(f) ;
}

var errors = require('./lib/errors');
function purryVar(/* f */){
  throw errors.no_vargs_support();
}

function purryFix(psize, f){
  return algo_fixed(f, array_of(psize, syntax.hole.val), psize, 0, psize-1);
}










