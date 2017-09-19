var gulp = require('gulp');
var copy = require('gulp-copy');
var del = require('del');
var browserSync = require('browser-sync');

// copy static resources to site dir
gulp.task('static', ['static:fonts'], function () {
	return gulp.src(['src/index.html', 'src/images/**/*'])
		.pipe(copy('build', { prefix: 1 }));
});

gulp.task('static:fonts', ['static:fonts-bootstrap'], function(){
	return gulp.src(['node_modules/gentelella/vendors/font-awesome/fonts/*.*', 'node_modules/ionicons/dist/fonts/*.*'])
		.pipe(copy('build/fonts', { prefix: 99 }));
});

gulp.task('static:fonts-bootstrap', function(){
	return gulp.src(['node_modules/bootstrap-sass/assets/fonts/bootstrap/*.*'])
		.pipe(copy('build/fonts/bootstrap', { prefix: 99 }));
});

//watch
gulp.task('watch', ['build'], function () {
	gulp.watch(['src/**/*.js', '!src/**/*.handlebars.js', 'src/**/*.handlebars'], function () {
		gulp.start('scripts:app', browserSync.reload);
	});
	gulp.watch(['src/**/*.scss'], function () {
		gulp.start('styles', browserSync.reload);
	});
	gulp.watch(['src/index.html'], function () {
		gulp.start('static', browserSync.reload);
	});
});

gulp.task('browserSync', function () {
	browserSync({
		port: 3002,
		server: {
			baseDir: 'build/',
			index: "index.html",
			routes: {
				'/node_modules': 'node_modules',
				'/buildTemp': 'buildTemp'
			}
		}
	})
});

//build
gulp.task('build', ['scripts', 'static', 'styles']);

//clean
gulp.task('clean:js-externals', function () {
	return del(['build/externals.js', 'build/externals.js.map']);
});
gulp.task('clean:js-app', function () {
	return del(['build/app.js', 'build/app.js.map', '!build/externals.js', 'buildTemp/**/*.js']);
});
gulp.task('clean:styles', function () {
	return del(['build/app.css', 'build/app.css.map']);
});
gulp.task('clean:html', function () {
	return del(['build/index.html']);
});
gulp.task('clean', ['clean:js-externals', 'clean:js-app', 'clean:html', 'clean:styles']);

// run server
gulp.task('server', ['watch'], function () {
	gulp.start('browserSync');
});
