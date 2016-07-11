'use strict';

// Modules
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function makeWebpackConfig() {
  var config = {
    resolve: {
      extentions: ["js"],
      alias: {
        moment: "moment/min/moment-with-locales.min.js",
        io: "socket.io-client"
      }
    }
  };

  // config.externals = {
  //   'io': true
  // };
  config.entry = {
    vendors: ['lodash', 'angular', 'angular-ui-router', 'angular-animate', 'angular-messages', 'angular-material'],
    app: ['./client/index.js']
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
    }, {
      test: /\.less$/,
      loader: 'style!css!less'
    }],
    noParse: [/moment-with-locales/]
  };

  config.postcss = [
    autoprefixer({
      browsers: ['last 2 version']
    })
  ];

  config.plugins = [
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: ['commons'],
    //   minChunks: Infinity
    // }),
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