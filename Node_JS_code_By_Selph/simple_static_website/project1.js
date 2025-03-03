

const http = require("http");
const fl = require("fs");
const url = require("url");

http.createServer((request, Response) => {


    // fetching the path 

    const path = request.url;

    if (path == "/about") {

        console.log("about url");

        Response.writeHead(200, { "content-type": "text/html" });

        const content_object = fl.readFileSync("./views/about.html");

        Response.write(content_object);
        Response.end();

    } else if (path == "/") {
        console.log("home path");

        Response.writeHead(200, { "content-type": "text/html" });

        const content_object = fl.readFileSync("./views/home.html");

        Response.write(content_object);
        Response.end();
    }
    else if (path == "/services") {
        console.log("service path");

        Response.writeHead(200, { "content-type": "text/html" });

        const content_object = fl.readFileSync("./views/services.html");

        Response.write(content_object);
        Response.end();
    }




}).listen(1010);

console.log(__dirname);
console.log(__filename);
