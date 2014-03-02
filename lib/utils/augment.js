'use strict';



function augment(a, b){
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}

function augmentBackup(a, b, backup){
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      backup[key] = a[key];
      a[key] = b[key];
    }
  }
  return a;
}



module.exports = augment;
module.exports.withBackup = augmentBackup;