
const http_method = require("http");
const url_detail = require("url");

http_method.createServer((request, Response) => {

    console.log(request.url);

    const urlObj = url_detail.parse(request.url, true);
    // to display or maintain the query object we are using true keyword in url.parse().
    console.log(urlObj);

    // to get the url_object propaties we can use the . operater
    console.log(urlObj.query.keywords);

}).listen(4040);