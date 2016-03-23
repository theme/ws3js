var gulp = require('gulp');
var dirSync = require('gulp-directory-sync');
var coffee = require('gulp-coffee');
var coffeelint = require('gulp-coffeelint');

var onError = function(e){};

// sync
var srcDir= 'src/';
var destDir = 'pub/';
// compile
var build_dir = "pub/";
var coffeescript_files = ['src/**/*.coffee','src/**/*.litcoffee'];

gulp.task('sync', function() {
    gulp.src(coffeescript_files)
    .pipe(dirSync(srcDir, destDir, {
        ignore:[/.*\.swp$/i,/.*\.coffee$/i, /.*\.litcoffee/i],
        printSummary: true
    }))
    .on('error', onError);
});

gulp.task('validate_coffee', function () {
    gulp.src(coffeescript_files)
    .pipe(coffeelint())
    .pipe(coffeelint.reporter());
});

gulp.task('compile_coffee', ['validate_coffee'], function() {
    gulp.src(coffeescript_files)
    .pipe(coffee({bare: true}).on('error', onError))
    .pipe(gulp.dest(build_dir));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*', ['compile_coffee','sync']);
});

gulp.task('default', ['sync','watch']);

