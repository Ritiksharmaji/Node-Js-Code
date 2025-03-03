
const fl = require("fs");

const content = "this is dynamic content for writing file by js into file";

fl.writeFile("new_file.txt", content, (error) => {

    if (error) {
        console.log("error");
        console.log(error);
    }
    else {
        console.log("sucess full file create");
    }

});