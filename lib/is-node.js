
var platform = typeof window  !== 'undefined' ? 'browser' :
                 typeof process !== 'undefined' ? 'node' :
                                                  'unknown' ;

module.exports = platform === 'node';