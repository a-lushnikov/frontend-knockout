var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    del = require('del');

// removes already existing build dir
gulp.task('clean', function () {
    del('build');
    del('views/css/*.min.css');
    del('css/*.min.css');
    del('views/js/*.min.js');
    del('js/*.min.js');
    del('img/*o3*');
})

// copies src to deploy folder
// gulp.task('deploy', function() {
//     return gulp.src(['./**/*', '!node_modules', '!node_modules/**/*'])
//         .pipe(gulp.dest('build'))
//         .on('end', function () {
//             del('build/gulpfile.js');
//             del('build/package.json');
//         });
// });

gulp.task('min-css1', function() {
  return gulp.src('css/*.css')
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('css/'));
});

gulp.task('min-css2', function() {
  return gulp.src('views/css/*.css')
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('views/css/'));
});

gulp.task('min-css', ['min-css1', 'min-css2']);

gulp.task('min-js1', function() {
  return gulp.src('js/*.js')
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('js/'));
});

gulp.task('min-js2', function() {
  return gulp.src('views/js/*.js')
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('views/js/'));
});

gulp.task('min-js', ['min-js1', 'min-js2']);


// adopted from https://markgoodyear.com/2014/01/getting-started-with-gulp/
// use this to get optmized images
gulp.task('img', function() {
  return gulp.src('img/**/*')
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(rename({suffix: 'o3'}))
    .pipe(gulp.dest('img'))
});

gulp.task('min', ['min-css', 'min-js', 'img']);

