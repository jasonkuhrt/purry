'use strict';



exports.last = last;
exports.clone_array = clone_array;
exports.to_array = to_array;
exports.array_of = array_of;



function array_of(size, value){
  var arr = [];
  while (size-- > 0) arr.push(value);
  return arr;
}

function to_array(array){
  return Array.prototype.slice.apply(array);
}

function clone_array(array){
  var clone = [];
  var count = array.length;
  var i = 0;
  while(i < count) {
    clone.push(array[i]);
    i++;
  }
  return clone;
}

function last(arr){
  return arr[arr.length - 1];
}