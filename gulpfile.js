var gulp = require('gulp');
var cache = require('gulp-cache');
var gutil = require('gulp-util');

var coffee = require('gulp-coffee');
var coffeelint = require('gulp-coffeelint');


//////////////////// CoffeeScript ////////////////////
var build_dir = "pub/";
var coffeescript_files = ["scripts/**/*.coffee"];

gulp.task('validate_coffee', function () {
    gulp.src(coffeescript_files)
    .pipe(coffeelint())
    .pipe(coffeelint.reporter());
});

gulp.task('compile_coffee', ['validate_coffee'], function() {
    gulp.src(coffeescript_files)
    // .pipe(cache('coffee'))
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest(build_dir));
});

gulp.task('watch', function() {
    gulp.watch(coffeescript_files, ["compile_coffee"]);
});

gulp.task('default', ['watch']);
