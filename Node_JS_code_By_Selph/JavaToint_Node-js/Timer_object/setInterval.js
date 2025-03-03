

var i = 0;
console.log(i);
let x = setInterval(function () {
    i++;
    console.log(i);
    if (i == 10) {
        clearInterval(x);
    }
}, 1000);   