{GLOBE, isClient} = require('plat')

GLOBE['purry'] = (if isClient then require('purry') else require('../')).install()

GLOBE.a = require('chai').assert;
GLOBE.eq = GLOBE.a.deepEqual;

GLOBE.echo6 = create_fixed_echo(6)