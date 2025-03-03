



var mysql = require('mysql');

var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "Ritik",
    password: "root123",
    database: "nodeJsOperation"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE users ( id integer primary key AUTO_INCREMENT ,name VARCHAR(255), address VARCHAR(255))";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
});