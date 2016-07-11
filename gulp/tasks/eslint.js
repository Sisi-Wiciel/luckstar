$ = require('gulp-load-plugins')();
var gulp = require('gulp');
var config = require('../config');
exports.task = function() {
  return gulp.src(config.jsFiles)
  .pipe($.eslint())
  .pipe($.eslint.format())
};
