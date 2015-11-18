var winston = require('winston');

//winston.handleExceptions(new winston.transports.File({ filename: 'exceptions.log' }))

var logger = new (winston.Logger)({
  level: 'info',
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
    //  json: true
    //})
  ]
});


module.exports = logger;