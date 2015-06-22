var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    htmlreplace = require('gulp-html-replace')
    del = require('del');


// create build folder
// minify and concat js and place it in all.min.js
// minify and concat css and place it in all.min.css
// copy
// | index.html
// | all.min.css
// | all.min.js
// to the build folder
// replace references in index.html with all.min.css and all.min.js

// copies index to build folder and replaces references
gulp.task('copy-index', function() {
  return gulp.src(['index.html'])
    .pipe(htmlreplace({
        'css': 'css/all.min.css',
        'js': 'js/all.min.js'
    }))
    .pipe(gulp.dest('build'));
});

// copies js to build folder
gulp.task('build-js', function() {
  return gulp.src(['bower_components/jquery/dist/jquery.min.js', 'bower_components/knockout/dist/knockout.js', 'js/**'])
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('build/js'));
});

// copies css to build folder
gulp.task('build-css', function() {
  return gulp.src(['css/bootstrap.min.css', 'css/style.css'])
    .pipe(minifycss())
    .pipe(concat('all.min.css'))
    .pipe(gulp.dest('build/css'));
});


// removes already existing build dir
gulp.task('clean', function () {
    del('build/**/*');
});



gulp.task('build', ['copy-index', 'build-js', 'build-css']);

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});

