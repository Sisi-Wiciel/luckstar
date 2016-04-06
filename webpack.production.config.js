'use strict';

// Modules
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');

module.exports = function makeWebpackConfig() {
  var config = require('./webpack.config');

  config.output = {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].js'
  };

  config.devtool = 'source-map';

  config.plugins.push(

  new ExtractTextPlugin('[name].[hash].css'),

  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.UglifyJsPlugin({
    include: /app*.js/,
    compress: {
      warnings: false
    }
  })
  //new CopyWebpackPlugin([{
    //from: __dirname + '/client/libs/css'
  //}])
  );

  return config;
}();