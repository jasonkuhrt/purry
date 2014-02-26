'use strict';
/* global describe, it */
require('./lib/assert-extras');
var purry = require('../').install();
var util = require('./lib/util'),
    create_fixed_echo = util.create_fixed_echo;
    //create_vparam_echo = util.create_vparam_echo;
var test_currying = require('./currying');
var test_partialing = require('./partialing');




describe('purry', function(){
  test_currying(purry);

  describe('partialing a fixed-params-function', function(){
    var f = create_fixed_echo(6);
    require('./partialing-fixed-params')(f);
    test_partialing(f.check, f);
  });


  // describe('partialing a vparam-function', function(){
  //   var f = util.create_vparam_echo(6);

  //   test_partialing(f.check, f);

  //   describe('implementation details', function(){
  //     describe('hole-tracking-optimizations do not cause subtle bugs', function(){
  //       // Holey functions slow performance.
  //       // Hole-tracking finds the optimal path.
  //       it('Left-shoulder holes are stored even when following invocation does not interact with left-shoulder', function(){
  //         f.check(f(_,1,2)(___,5)(0,3,4));
  //       });

  //       it('Right-shoulder holes are stored even when following invocation does not interact with right-shoulder', function(){
  //         f.check(f(___,3,4,_)(0,1,___)(___,5)(2));
  //       });
  //     });
  //   });

  //   describe('Discovered edge cases', function () {
  //     it.skip('(_, _, ___)(___)(___, 2, _)(___, _, _)(_, 1, _, 3, ___)(___)(___, _, _, _)(___, _, _, _, 0)()', function (done) {
  //       var f = create_vparam_echo(4)
  //       f.check(f(_, _, ___)(___)(___, 2, _)(___, _, _)(_, 1, _, 3, ___)(___)(___, _, _, _)(___, _, _, _, 0)());
  //     });
  //   });
  // });
});