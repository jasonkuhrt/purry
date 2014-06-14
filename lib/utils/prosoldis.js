var tt = require('./terminal-text');

var titles = {
  problem: 'Problem',
  solution: 'Solution',
  code: 'Code'
};

var order = [
  'problem',
  'solution',
  'code'
];



module.exports = render;

function render(o){
  return to_sects(o).map(function(v){
    return tt.col(12, v.title, v.body) ;
  }).join('\n\n');
}



// Private

function to_sects(o){
  return order.map(function(label){
    return o[label] ? sect(label, o[label]) : null ;
  }).filter(function(a){ return !!a; });
}

function sect(label, body){
  return {
    title: titles[label],
    body: body
  };
}