'use strict';



function array_of(size, value){
  var arr = [];
  var i = size;
  while (i > 0) {
    arr.push(value);
    i--;
  }
  return arr;
}

function last(arr){
  return arr[arr.length - 1];
}

function augment(a, b){
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}

function augment_with_backup(a, b, backup){
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      backup[key] = a[key];
      a[key] = b[key];
    }
  }
  return a;
}

function rev_lookup_or_pass(dict, val){
  for (var key in dict){ if (dict.hasOwnProperty(key)) {
    if (dict[key] === val) return key;
  }}
  return val;
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

function space(size){
  var acc = '', i = 0;
  while (i++ < size) acc += ' ';
  return acc;
}



exports.last = last;
exports.clone_array = clone_array;
exports.to_array = to_array;
exports.rev_lookup_or_pass = rev_lookup_or_pass;
exports.array_of = array_of;
exports.augment = augment;
exports.augment_with_backup = augment_with_backup;
exports.space = space;