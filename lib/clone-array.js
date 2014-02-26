'use strict';



function cloneArray(array){
  var clone = [];
  var count = array.length;
  var i = 0;
  while(i < count) {
    clone.push(array[i]);
    i++;
  }
  return clone;
}



module.exports = cloneArray;