'use strict';



module.exports = function arrayOf(size, value){
  var arr = [];
  var i = size;
  while (i > 0) {
    arr.push(value);
    i--;
  }
  return arr;
};