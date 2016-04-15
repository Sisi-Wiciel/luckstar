var gulp = require('gulp'),
path = require('path'),
webpack = require('webpack'),
del = require('del'),
gutil = require('gutil'),
runSequence = require('run-sequence'),
WebpackDevServer = require("webpack-dev-server");
$ = require('gulp-load-plugins')();

gulp.task('default', function() {

});

gulp.task("webpack-dev-server", function(callback) {
  var config = require('./webpack.develop.config');
  new WebpackDevServer(webpack(config), {
    // webpack-dev-server options
    stats: { colors: true },
    historyApiFallback: true,
    contentBase: __dirname + "/client/",
    hot: true,
    proxy: {
      "/api/*": "http://localhost:3000/"
    },
  })
  .listen(8080, "localhost", function(err) {
    if (err) throw new gutil.PluginError("webpack-dev-server", err);
    gutil.log("[webpack-dev-server]", "http://localhost:8080/");
  })
});

// Javascripts
gulp.task('eslint', function() {
  return gulp.src(['client/**/*.js', '!client/**/*.min.js'])
  .pipe($.eslint())
  .pipe($.eslint.format())
});

// clean build
gulp.task('clean', function(cb) {
  return del(['dist/*'], cb);
});

gulp.task('copy', function() {
  gulp.src([
    'client/**/*.html',
    'client/**/*.png',
    'client/**/*.gif',
  ]).pipe(gulp.dest('dist'))
  .pipe($.size({title: 'copy'}));
});

gulp.task('build', ['clean', 'eslint', 'copy'], function() {
  gulp.src('client/app.js')
  .pipe($.webpack(require('./webpack.production.config.js')))
  .pipe(gulp.dest('dist/'))
});

