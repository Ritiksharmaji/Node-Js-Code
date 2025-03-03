
// with Http models

const server = require('http');

server.createServer(function (req, res) {


    res.write("Welcome to Ritik Node-js");
    res.write("Welcome to Ritik Node-js");
    res.write("<h2>this node-js is only for you<h2>");

    res.end();

}).listen(2020);