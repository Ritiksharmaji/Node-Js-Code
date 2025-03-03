

function SetUser(usernaeme) {
    // db calls
    this.usernaeme = usernaeme;
    console.log("called")

}
function createUser(usernaeme, password, emai) {

    SetUser.call(this, usernaeme);
    // here call function is used to  corrent exceution context to pass other function
    this.emai = emai;
    this.password = password;
}

const chai = new createUser("ritik", "ritik@123", "ritik@gmail.com");
console.log(chai);