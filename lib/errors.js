
exports.pins_error = function(){
  return new SyntaxError('You cannot use more than one pin per purry instance.');
};