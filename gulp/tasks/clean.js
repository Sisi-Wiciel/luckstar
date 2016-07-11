var del = require('del');
var config = require('../config');

exports.task = function(cb) {
  return del([config.outputDir + '/**/*'], cb);
};
