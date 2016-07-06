var winston = require('winston');

var settings = require('./config/setting');

//winston.handleExceptions(new winston.transports.File({ filename: 'exceptions.log' }))

var logger = new (winston.Logger)({
  level: settings.LOG.LEVEL,
  transports: [
    new (winston.transports.Console)({
      //handleExceptions: true,
      timestamp: true,
      prettyPrint: true,
      json: false
    })
    //new (winston.transports.File)({
    //  filename: 'luckstar.log',
    //  maxsize: 40000,
    //  maxFiles: 10,
    //  json: false
    //})
  ]
});

module.exports = logger;
