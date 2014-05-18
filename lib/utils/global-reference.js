'use strict';



module.exports = globalReference;

function globalReference(){
  return (typeof window !== 'undefined' && window) ||
  GLOBAL;
}