var gulp = require('gulp'),
path = require('path'),
webpack = require('webpack'),
del = require('del'),
gutil = require('gutil'),
runSequence = require('run-sequence'),
WebpackDevServer = require("webpack-dev-server");
$ = require('gulp-load-plugins')();

var gulpSSH = new $.ssh({
  ignoreErrors: false,
  sshConfig: require('./config/config.json')
})

gulp.task("webpack-dev-server", function(callback) {
  var config = require('./webpack.develop.config');
  new WebpackDevServer(webpack(config), {
    // webpack-dev-server options
    stats: {colors: true},
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
  return del(['dist/*.zip', 'dist/server/**/*', 'dist/web/**/*'], cb);
});

gulp.task('copy', function() {
  return gulp.src([
    'client/**/*.html',
    'client/**/*.png',
    'client/**/*.gif'
  ])
  .pipe($.if(['**/*.html', '!index.html'], $.htmlmin({
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
});

gulp.task('buildWeb', ['eslint', 'copy'], function() {
  return gulp.src('client/index.js')
  .pipe($.webpack(require('./webpack.production.config.js')))
  .pipe(gulp.dest('dist/web'))
});

gulp.task('buildServer', function() {
  return gulp.src('server/**/*')
  .pipe(gulp.dest('dist/server'))
});

gulp.task('build', function(cb) {
  runSequence('clean', ['buildWeb', 'buildServer'], cb);
});

var archiveName = 'archive-lastest.zip';

gulp.task('release', ['build'], function() {
  return gulp.src('dist/**/*')
  .pipe($.zip(archiveName))
  .pipe(gulp.dest('dist/'));
})

gulp.task('deploy', ['release'], function() {
  return gulp.src('dist/' + archiveName)
  .pipe(gulpSSH.dest('/root/'));
    //gulpSSH.shell(['sh /root/install.sh'], {filePath: 'server.log'});
});