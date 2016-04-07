var gulp = require('gulp'),
path = require('path'),
del = require('del'),
runSequence = require('run-sequence'),
$ = require('gulp-load-plugins')();


gulp.task("vendor", function() {
  return gulp.src([
    'node_modules/angular/angular.min.js',
    'node_modules/angular-ui-router/release/angular-ui-router.min.js',
    'node_modules/angular-animate/angular-animate.min.js',
  ])
  //.pipe( $.order([
  //  'angular/angular.min.js',
  //  'angular-ui-router/release/angular-ui-router.min.js',
  //  'angular-animate/angular-animate.min.js',
  //], {base: './node_modules'}))
  .pipe( $.concat('vendor.js'))
  .pipe( $.size() )
  .pipe(gulp.dest('dist/'))
});


gulp.task('default', function() {
  return gulp.src('client/app.js')
  .pipe( $.webpack(require('./webpack.config.js')) )
  .pipe(gulp.dest('dist/'))
});

// clean build
gulp.task('clean', function(cb) {
  return del(['dist/*', '.tmp'], cb);
});

// Javascripts
gulp.task('scripts', function() {
  gulp.src(['client/**/*.js', '!client/libs/*.js', '!client/*.js'])
  .pipe($.eslint())
  .pipe($.eslint.format())
  .pipe($.newer('.tmp/scripts'))
  .pipe(gulp.dest('.tmp/scripts'))
  .pipe($.uglify())
  .pipe($.concat('main.js'))

  // Output files
  .pipe($.size({gzip: true, title: 'scripts'}))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('dist/'))
});

gulp.task('style', function() {
  gulp.src(['client/libs/less/common.less',
    'client/rooms/**/*.less',
    'client/topics/**/*.less',
    'client/users/**/*.less',
    'client/components/**/*.less'
  ])
  .pipe($.less({
    paths: [path.join(__dirname, 'client', 'libs', 'less')]
  }))
  .pipe($.size({gzip: true, title: 'style'}));
});

gulp.task('images', function() {
  gulp.src(['client/libs/images/**/*'])
  .pipe($.cache($.imagemin({
    progressive: true,
    interlaced: true
  })))
  .pipe($.size({title: 'images'}))
  .pipe(gulp.dest('dist/images'))
});

gulp.task('html', function() {
  return gulp.src('client/**/*.html')
  .pipe($.useref({searchPath: '{.tmp,client}'}))
  // Remove any unused CSS
  .pipe($.if('*.css', $.uncss({
    html: [
      'client/index.html'
    ],
    ignore: []
  })))

  .pipe($.if('*.css', $.cssnano()))

  .pipe($.if('*.html', $.htmlmin({
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
  .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
  .pipe(gulp.dest('dist'));
});

gulp.task('copy', function() {
  gulp.src([
    'client/favicon.ico',
    'client/require.min.js'
  ]).pipe(gulp.dest('dist'))
  .pipe($.size({title: 'copy'}));
});

gulp.task('replace', ['clean'], function() {
  gulp.src('client/app.js')
  .pipe($.replace(/appComponentRequires =([^;]*)/g, 'appComponentRequires = []'))
  .pipe(gulp.dest('.tmp/'));
});

gulp.task('rjs', ['prebuild'], function () {
  gulp.src('.tmp/*.js')
  .pipe($.requirejsOptimize(function(file) {
    return {
      mainConfigFile:'.tmp/require.config.js'
    };
  }))
  .pipe($.uglify())
  .pipe($.concat('require.config.js'))
  .pipe(gulp.dest('dist/'));
});

gulp.task('build', ['clean'], function() {
  runSequence('style', ['scripts', 'rjs', 'html', 'images', 'copy']);
});

