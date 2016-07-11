// var gulp = require('gulp'),
// fs = require('fs'),
// os = require('os'),
// path = require('path'),
// webpack = require('webpack'),
// del = require('del'),
// gutil = require('gutil'),
// runSequence = require('run-sequence'),
// WebpackDevServer = require("webpack-dev-server");
// $ = require('gulp-load-plugins')();
//
// var gulpSSH = new $.ssh({
//   ignoreErrors: false,
//   sshConfig: {
//     host: '139.129.60.92',
//     port: 22,
//     username: 'root',
//     privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh/id_rsa'))
//   }
// });
//
//
// var archiveName = 'archive-lastest.zip';
//
// gulp.task('release', ['build'], function() {
//   return gulp.src('dist/**/*')
//   .pipe($.zip(archiveName))
//   .pipe(gulp.dest('dist/'))
//   .pipe(gulpSSH.dest('/root/'))
// })
//
// gulp.task('server', ['release'], function() {
//   return gulpSSH
//   .shell(['sh server.sh'], {filePath: 'shell.log'})
//   .pipe(gulp.dest('logs'))
// });


var gulp = require('gulp');
var fs = require('fs');

fs.readdirSync('./gulp/tasks')
.filter(function (filename) {
  return filename.match(/\.js$/i);
})
.map(function (filename) {
  return {
    name: filename.substr(0, filename.length - 3),
    contents: require('./gulp/tasks/' + filename)
  };
})
.forEach(function (file) {
  gulp.task(file.name, file.contents.dependencies, file.contents.task);
});
