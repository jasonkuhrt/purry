var pe = require('./lib/utils/prelude'),
    array_of = pe.array_of
var algo_fixed = require('./lib/algo-fixed')
var syntax = require('./lib/syntax')



module.exports = purry

purry.auto = purry_auto
purry.vari = purry_vari
purry.fix = purry_fix

purry.purry1 = function purry1(f){ return purry_fix(1, f) }
purry.purry2 = function purry2(f){ return purry_fix(2, f) }
purry.purry3 = function purry3(f){ return purry_fix(3, f) }
purry.purry4 = function purry4(f){ return purry_fix(4, f) }
purry.purry5 = function purry5(f){ return purry_fix(5, f) }

purry.install = require('./lib/install')(purry)



function purry(f, psize){
  return  psize === 0 ?   purry_vari(f)       :
          psize > 0   ?   purry_fix(psize, f) :
                          purry_auto(f)
}


function purry_auto(f){
  return f.length ? purry_fix(f.length, f) : purry_vari(f)
}

var errors = require('./lib/errors')
function purry_vari(/* f */){
  throw errors.no_vargs_support()
}

function purry_fix(psize, f){
  return algo_fixed(f, array_of(psize, syntax.hole.val), psize, 0, psize-1)
}