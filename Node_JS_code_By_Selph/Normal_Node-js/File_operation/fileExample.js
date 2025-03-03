

const fl = require("fs");

// reading
// writing
//applending
// deleting

/* reading : in trading there are two ways
ways 1: sysncronus way
ways 2: asysncronus way  */

// asysncronus way

fl.readFile("./abc.txt", (error, data) => {

    if (error) {
        console.log("error");
        console.log(error);
    }
    else {
        console.log("data");
        console.log(data.toString());
        // to get the data into string formate otherwise it will show in buffer formate..
        console.log(data);
    }
});
console.log("terminated");
