
let myheros = ["thor", "spiderman"];

// object
let heroPowe = {
    thor: "hammer",
    spiderman: "slipping"
}


Object.prototype.ritik = function () {
    console.log("ritik function is avalible for all object:");
}

Array.prototype.badboy = function () {
    console.log("this is accessible only for arrry");
}
// this new propaties of Array object is only accessible for Array types object or instace not for all 
// like - Object instace or function instace

//heroPowe.ritik()
// apply this function on array 
myheros.ritik()

myheros.badboy();
heroPowe.badboy();