
module.exports = make_suite;


function make_suite(generator, reporter){
  return ;

  var tests = [];

  function add(generator, reporter){
    tests.push()

  }

  function run_suite(count){
    times(count, run_once);
  }

  function run_once(){
    console.log(reporter(generator()));
  }
}
