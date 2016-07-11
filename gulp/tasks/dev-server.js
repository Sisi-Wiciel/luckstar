var gulp = require('gulp');
var config = require('../config');
var webpack = require('webpack');
var WebpackDevServer = require("webpack-dev-server");
var gutil = require('gutil');
var path = require('path');

exports.task = function() {
  return new WebpackDevServer(webpack(require(config.webpackDevConfig)), {
    stats: {colors: true},
    historyApiFallback: true,
    contentBase: path.join(config.ROOT, 'client'),
    hot: true,
    proxy: {
      "/api/*": "http://localhost:3000/"
    }
  })
  .listen(8080, "localhost", function(err) {
    if (err) throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log("[webpack-dev-server]", "http://localhost:8080/");
  })
};