var http = require('http');
var dt = require('./myfirstmodule');
var fs = require('fs');
var url = require('url');


http.createServer(function (req, res) {
    console.log('got a request...');

    fs.readFile('./demo.html', function (error, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
    });
}).listen(8080);