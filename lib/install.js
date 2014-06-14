var syntax = require('./syntax');
var globe = require('plat').GLOBE;


/*
A purry "plugin" which returns a function
which in turn returns the purry the function.

This is so that we can design a plugin in isolation
but achieve chaining behaviour with the host.

Because this is the only plugin we have not
extracted the plugin notion into its own utility.

The "install" plugin will augment the global scope
with idents assigned to purry's special pin and hole
values. In this way we achieve the look-and-feel of
a syntax addition to JavaScript.
*/
module.exports = function PLUGIN(purry){

  function install(custom_idents){
    custom_idents = custom_idents || {};

    /* If custom identifiers are being used
    store them in the syntax object so that
    error messages can use these idents instead
    of _ / ___. e.g. if a user wants to use x / o
    their error messages should reflect that "syntax".*/
    if (custom_idents._) syntax.hole.ident_custom = custom_idents._;
    if (custom_idents.___) syntax.pin.ident_custom = custom_idents.___;

    // Expose the idents in global scope
    globe[custom_idents._ || syntax.hole.ident] = syntax.hole.val;
    globe[custom_idents.___ || syntax.pin.ident] = syntax.pin.val;

    /* Return purry for chaining purposes.
    This makes it easy to require and install
    in the same line, e.g. x = require('purry').install() */
    return purry;
  }

  /* Libraries that want to use purry
  should do so by exposing local variables.
  We can enable that by exposing the idents
  as props so that they can manually assign
  or destructure them into scope. */
  install[syntax.hole.ident] = syntax.hole.val;
  install[syntax.pin.ident] = syntax.pin.val;

  return install;
};