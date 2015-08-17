var express = require('express');
var mongoose = require('mongoose');
var app = express();

mongoose.connect('mongodb://localhost/luckstar');

require('./config/express')(app);
require('./config/route')(app);
require('./config/socketio')();
require('./config/redis')();
var winston = require('winston');
winston.level = 'debug'

module.exports = app;


