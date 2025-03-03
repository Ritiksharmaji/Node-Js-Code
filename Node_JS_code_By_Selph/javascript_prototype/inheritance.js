
class User {

    constructor(username) {
        this.username = username;
    }

    logMe() {
        console.log(`UserName is:${this.username}`);
    }
}

class Faculty extends User {

    constructor(username, email, password) {

        super(username)
        // to accees the username throw the super key..
        this.emai = email;
        this.password = password;
    }
    addCourse() {
        console.log(`A new course was added by ${this.username}`);
    }
}

const university = new Faculty("ankit", "ankit@gmai.com", "ankit@124");

university.addCourse();

university.logMe(); // 