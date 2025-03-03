
/*
class User {

    constructor(username, password, emai) {
        this.username = username;
        this.password = password;
        this.emai = emai;
    }

    encriptPassword() {
        return `${this.password}abcxx`;
    }
    changeUsername() {
        return `${this.username.toUpperCase()}`;
    }

}

const chai = new User("ritik", "ritik@124", "ritik@gmai.com");
console.log(chai.encriptPassword());
console.log(chai.changeUsername());      */

// Behinde the operation.... means without class 

function User(username, password, emai) {

    this.username = username;
    this.password = password;
    this.emai = emai;

}

User.prototype.encriptPassword = function () {

    return `${this.password}abcxx`;
}

User.prototype.changeUsername = function () {
    return `${this.username.toUpperCase()}`;
}


const tea = new User("ankit", "ankit@124", "ankit@gmai.com");

console.log(tea.changeUsername());
console.log(tea.encriptPassword());     