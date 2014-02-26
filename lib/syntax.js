var hole = {
  ident: '_',
  value: '_'
};

var pin = {
  ident: '___',
  value: '___'
};

var lookup = {};
lookup[hole.ident] = hole.value;
lookup[pin.ident] = pin.value;



exports.hole = hole;
exports.pin = pin;
exports.lookup = lookup;