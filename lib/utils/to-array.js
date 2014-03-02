'use strict';



function toArray(array){
  return Array.prototype.slice.apply(array);
}



module.exports = toArray;