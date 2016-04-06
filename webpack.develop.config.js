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

  config.module.devServer = config.devServer = {
    contentBase: './client',
    hot: true,
    historyApiFallback: false,
    //stats: 'minimal',
    proxy: {
      '/api/*': {
        target: 'http://localhost:3000/',
        secure: false
      },
    }
  };

  return config;
}();