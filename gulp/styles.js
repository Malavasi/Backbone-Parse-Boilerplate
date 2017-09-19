var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');

// compile sass
gulp.task('generate-css', function () {
	return gulp.src('./src/css/app.scss')
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write('./', { sourceRoot: '/src' }))
		.pipe(gulp.dest('buildTemp'));
});

gulp.task('styles',['generate-css'], function() {
  return gulp.src('buildTemp/app.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('build'));
});