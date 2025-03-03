
// this is second step that is import the user-define module in other file.

const operation = require("./ArthmaticOperation_Modul");


const add = operation(43, 4, 56);
console.log(add);