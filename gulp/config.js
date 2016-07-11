var path = require('path');

var ROOT = path.join(__dirname, '../');

module.exports = {
  jsFiles: [
    'client/**/*.js',
    '!client/**/*.min.js'
  ],
  staticFiles: [
    'client/**/*.html',
    '!client/index.html',
    'client/**/*.png',
    'client/**/*.gif'
  ],
  outputDir: path.join(ROOT, 'dist'),
  webpackDevConfig: path.join(ROOT, 'webpack.develop.config.js'),
  webpackProductionConfig: path.join(ROOT, 'webpack.production.config.js'),
  ROOT: ROOT
};