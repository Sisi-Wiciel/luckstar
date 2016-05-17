'use strict';

// Modules
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var path = require('path');

module.exports = function makeWebpackConfig() {
  var config = require('./webpack.config');

  config.externals = {
    'moment': true,
    'bootstrap': true,
    'jquery': 'jQuery',
    'io': true
  };

  config.output = {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: '[name].[hash:8].js',
    chunkFilename: '[name].[hash:8].js'
  };

  config.devtool = 'source-map';

  config.plugins.push(

  new ExtractTextPlugin('[name].[hash:8].css'),

  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
  );

  return config;
}();