'use strict';



exports._ = '_';
exports.___ = '___';

exports.to_ident = function to_ident(x){
  return Object.keys(exports)[x] || x;
};