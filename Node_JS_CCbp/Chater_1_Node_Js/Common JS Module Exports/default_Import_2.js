

var addition = require('./default_Export_2');

// var { sum, minus, mul, div } = require('./default_Export_2');
var { mul, div } = require('./default_Export_2');

console.log(addition.add(12, 12));
console.log(addition.sub(12, 10));
console.log(addition.mul(12, 12));
console.log(addition.div(12, 3));
console.log("----------------------------");

// console.log(sum(4, 4));
// console.log(minus(4, 2));
console.log(mul(5, 5));
console.log(div(10, 2));
