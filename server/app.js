var express = require('express');
var mongoose = require('mongoose');
var process = require('process');
var app = express();
var http = require('http');

mongoose.connect('mongodb://localhost/luckstar');

require('./config/express')(app);
require('./config/route')(app);
require('./config/socketio')();
require('./config/redis')();


app.set('port', port);


var server = http.createServer(app);
var port = process.env.PORT || '3000';

server.listen(port);

module.exports = app;


