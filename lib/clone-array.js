
module.exports = function clone_array(array){
  var clone = [];
  var count = array.length;
  i = 0;
  while(i < count) {
    clone.push(array[i]);
    i++;
  }
  return clone;
};