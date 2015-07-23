var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var errorHandler = require('express-error-handler');
var app = express();


mongoose.connect('mongodb://localhost/luckstar');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'LuCk_StAr_SeCrEt',
  resave: true,
  saveUninitialized: true
}))
app.use(express.static(path.join(__dirname, '../client')));

app.use(errorHandler({ dumpExceptions: true, showStack: true }));

// load router config
require('./config/route')(app);
require('./config/redis').init();


module.exports = app;
