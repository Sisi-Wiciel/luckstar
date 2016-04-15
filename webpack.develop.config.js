'use strict';

// Modules
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

module.exports = function makeWebpackConfig() {
  var config = require('./webpack.config.js');
  config.devtool = 'eval-source-map';
  config.entry.app.unshift('webpack-dev-server/client?http://localhost:8080', 'webpack/hot/dev-server')
  config.debug = true;
  config.output = {
    path: __dirname + '/dist',
    publicPath: 'http://localhost:8080/',
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js'
  };

  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin('[name].[hash].css', {disable: true})
  );

  return config;
}();