
function mutipleBy5(num) {
    return num * 5;
}

mutipleBy5.power = 2;

console.log(mutipleBy5(5));
console.log(mutipleBy5.power);
console.log(mutipleBy5.prototype);

function createuser(username, price) {
    this.username = username;
    this.price = price;
    console.log("hi:" + this.price);
    let x = this.price;

}
// creating a prototype fucntion name as increase that
// is instance method of createuser function so all
// the instace can access it...

createuser.prototype.increase = function () {

    this.price++;
    // here we are using the this beacuse if we didn't use the
    // this keyword then it we not able to know that to which variable
    // it need to incease the values so by using the this keyword
    // it define that which call it that increase tha values of that one..

}

createuser.prototype.printMe = function () {
    console.log(`price:${this.price}`);
}
// without using the new keyword can't access this added feacture or properties..

const chai = new createuser("chai", 25);
const tea = createuser("tea", 125);

console.log(chai);
console.log(chai.increase);
console.log(chai.printMe);
chai.increase;
// console.log(chai.x); // can't access beacuse it is local variable of that function
//console.log(chai.printMe);
//;
