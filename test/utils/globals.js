/*global create_fixed_echo, eq */
'use strict';

var is_client = typeof GLOBAL === 'undefined';
var globe = is_client ? window : GLOBAL ;

globe['purry'] = (is_client ? require('purry') : require('../../index')).install() ;

globe.a = require('chai').assert;
globe.eq = globe.a.deepEqual;

globe.echo6 = create_fixed_echo(6);