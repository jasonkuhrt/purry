'use strict';



function revLookupOrPass(dict, val){
  for (var key in dict){ if (dict.hasOwnProperty(key)) {
    if (dict[key] === val) return key;
  }}
  return val;
}



module.exports = revLookupOrPass;