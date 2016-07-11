var config = require('../config');
var merge = require('merge-stream');
var path = require('path');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

exports.task = function() {
  return merge(buildServer(), buildClient(), copyStaticFiles());
};

exports.dependencies = ['clean', 'eslint'];

function buildServer() {
  return gulp.src('server/**/*')
  .pipe(gulp.dest(path.join(config.outputDir, 'server')));
}

function buildClient() {
  return gulp.src('client/index.js')
  .pipe($.webpack(require(config.webpackProductionConfig)))
  .pipe(gulp.dest(path.join(config.outputDir, 'web')));
  // .pipe($.webserver({
  //   livereload: true,
  //   directoryListing: true,
  //   open: true
  //   // path: 'dist/web/'
  // }));
}

function copyStaticFiles() {
  return gulp.src(config.staticFiles)
  .pipe($.if(['**/*.html'], $.htmlmin({
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    removeOptionalTags: true
  })))
  .pipe(gulp.dest('dist/web'))
  .pipe($.size({title: 'copy'}));
}