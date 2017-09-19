var gulp = require('gulp');
var Builder = require('systemjs-builder');

var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var copy = require('gulp-copy');
var gulpSequence = require('gulp-sequence');

var builderConfig = {
	defaultJSExtensions: true, // ignore js extension
	transpiler: 'plugin-babel',
	map: {
		"plugin-babel": "./node_modules/systemjs-plugin-babel/plugin-babel.js",
		"systemjs-babel-build": "./node_modules/systemjs-plugin-babel/systemjs-babel-node.js",
		"jquery": "node_modules/jquery/dist/jquery.min",
		"backbone": "node_modules/backbone/backbone-min",
		"underscore": "node_modules/underscore/underscore-min",
		"bootstrap": "node_modules/bootstrap/dist/js/bootstrap.min",
		"handlebars": "node_modules/handlebars/dist/handlebars.runtime.min",
		"parse": "node_modules/parse/dist/parse.min",
		"urijs": "node_modules/urijs/src/URI",

		// theme dependencies
		"fastclick": "node_modules/gentelella/vendors/fastclick/lib/fastclick", // not sure if is necessary, but it is loadded on all gentelella pages
		"nprogress": "node_modules/gentelella/vendors/nprogress/nprogress",
		"gentelella-helper": "node_modules/gentelella/src/js/helper",
		
		// root path
		"~": "buildTemp/js"
	},
	packages: {
		buildTemp: {
			meta: {
				"*.js": {
					format: "esm",
					babelOptions: {
						sourceMaps: true,
						compact: true
					}
				}
			}
		}
	},
	meta: {
		"jquery": {
			"format": "global",
			"exports": "jQuery"
		},
		"backbone": {
			"format": "global",
			"exports": "Backbone",
			"deps": [
				"jquery",
				"underscore"
			]
		},
		"underscore": {
			"format": "global",
			"exports": "_"
		},
		"handlebars": {
			"format": "global",
			"exports": "Handlebars"
		},
		"bootstrap": {
			"format": "global",
			"deps": [
				"jquery"
			],
			"exports": "jQuery"
		},
		"parse": {
			"format": "global",
			"exports": "Parse"
		},
		"GeoJSON": {
			"format": "global",
			"exports": "GeoJSON"
		},

		// theme + dependencies
		"fastclick": {
			"format": "global",
			"exports": "FastClick"
		},
		"nprogress": {
			"format": "global",
			"exports": "NProgress"
		},
		"gentelella-helper": {
			"format": "global",
			"exports": "jQuery",
			"deps": [
				"jquery"
			]
		},
	}
};

var createBulder = function () {
	var builder = new Builder();
	builder.config(builderConfig);
	return builder;
}

// copy js to buildTemp
gulp.task('scripts:copy-to-tmp', function () {
	return gulp.src(['src/js/**/*'])
		.pipe(copy('buildTemp', { prefix: 1 }));
});

// compile templates
gulp.task('scripts:templates', ['scripts:copy-to-tmp'], function () {
	return gulp.src('buildTemp/js/**/*.handlebars')
		.pipe(handlebars({
			handlebars: require('handlebars')
		}))
		.pipe(wrap('export default <%= contents %>;')) // make valid es6 modules
		.pipe(rename({
			suffix: '.handlebars',
		}))
		.pipe(gulp.dest(function (file) {
			return file.base;
		}));
});

// compile all thhirparty libraries
gulp.task('scripts:compile-externals', ['scripts:templates'], function () {
	var builder = createBulder();
	return builder.buildStatic('buildTemp/js/**/* - [buildTemp/js/**/*]', 'build/externals.js', {
		sourceMaps: true,
		sourceMapContents: false,
		minify: true,
		mangle: false,
		rollup: true,
		format: "global",
		globalName: "bundle",
		globalDeps: {}
	}).then(function () {
		console.log('Build externals complete');
	}).catch(function (err) {
		console.log('Build externals error');
		console.log(err);
	});
});

// compile all without externals
gulp.task('scripts:compile-app', ['scripts:templates'], function () {
	var builder = createBulder();

	var deps = {};
	for(var key in builderConfig.meta) {
		var dep = builderConfig.meta[key];
		if(dep.format == 'global' && dep.exports) {
			deps[key] = dep.exports;
		}
	}

	return builder.buildStatic('buildTemp/js/app.js', 'build/app.js', {
		sourceMaps: true,
		sourceMapContents: false,
		minify: true,
		mangle: false,
		rollup: true,
		format: "global",
		globalName: "bundle",
		globalDeps: deps
	}).then(function () {
		console.log('Build app complete');
	}).catch(function (err) {
		console.log('Build app error');
		console.log(err);
	});
});

// clean and compile all scripts
gulp.task('scripts', ['clean:js-app'], function (cb) {
	gulpSequence('scripts:compile-externals', 'scripts:compile-app', cb);
});

// clean and compile app scripts (without externals)
gulp.task('scripts:app', ['clean:js-app'], function (cb) {
	gulpSequence('scripts:copy-to-tmp', 'scripts:compile-app', cb);
});
