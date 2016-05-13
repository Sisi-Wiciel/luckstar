'use strict';

// Modules
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function makeWebpackConfig() {
  var config = {
    resolve: {
      alias: {},
      extentions: ["", "js"]
    },
    devtool: 'eval-source-map',
    externals: {
      'moment': true,
      'bootstrap': true,
      'jquery': 'jQuery',
      'io': true
    }
  };
  config.entry = {
    app: ['./client/index.js'],
    static: './client/core/static.js',
    vendors: ['angular', 'angular-ui-router', 'angular-animate', 'angular-material']
  };

  config.module = {
    preLoaders: [],
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style', 'css?sourceMap!postcss')
    }, {
      test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file'
    }, {
      test: /\.html$/,
      loader: 'raw'
    },
      {test: /\.less$/, loader: 'style!css!less'}]
  };

  config.postcss = [
    autoprefixer({
      browsers: ['last 2 version']
    })
  ];

  config.plugins = [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['vendors'],
      minChunks: Infinity
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new HtmlWebpackPlugin({
      template: './client/index.html',
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeOptionalTags: true
      }
    })
  ];

  return config;
}();