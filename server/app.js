var express = require('express');
var app = express();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/luckstar');

require('./config/express')(app);
require('./config/route')(app);
require('./config/socketio')()
require('./config/redis').init();


module.exports = app;
