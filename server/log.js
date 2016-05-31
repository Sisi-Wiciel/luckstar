var winston = require('winston');

//winston.handleExceptions(new winston.transports.File({ filename: 'exceptions.log' }))

var logger = new (winston.Logger)({
  level: 'debug',//{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
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
