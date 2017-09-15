"use strict";

const _ = require("lodash");
const gulp = require("gulp");
const tsc = require("gulp-tsc");
const babel = require("gulp-babel");
const argv = require('optimist').argv;
const concat = require("gulp-concat");
const pkg = require("./package.json");
const tslint = require("gulp-tslint");
const uglify = require("gulp-uglify");
const header = require("gulp-header");
const plumber = require("gulp-plumber");
const cleanCSS = require("gulp-clean-css");
const KarmaServer = require("karma").Server;
const runSequence = require("run-sequence");
const tsconfig = require("./tsconfig.json");
const Nightwatch = require("nightwatch");
const server = require("gulp-server-livereload");
const browserstack = require("browserstack-local");
const platforms = require("./test/config/platforms.browserstack.js");

/*
 * Commands
 *
 * $ gulp - lint, test and generate new build
 * $ gulp webserver - launch test webserver
 * $ gulp test - launch local unit tests
 * $ gulp integration - launch local integration tests
 * $ gulp ci - launch multi-platform cloud unit & integration tests
 *
 */

const paths = {
	tscripts : { 
		src : tsconfig.include,
		dest : "dist",
		testDest: "test/dist"
	}
};

const testPaths = {
	tscripts : { 
		src : ["test/*.js"],
		dest: "test/build"
	}
};

const banner = [
	"/**",
	" * <%= pkg.name %> - <%= pkg.description %>",
	" * @version v<%= pkg.version %>",
	" * @link <%= pkg.homepage %>",
	" * @license <%= pkg.license %>",
	" */", 
	"",
	""
].join("\n");

gulp.task("compile", done => {
	runSequence(
		"compile:ts",
		"compile:css",
		done
	);
});

gulp.task("watch", () => {
	gulp.watch("lib/**/*.ts", ["compile"]);
});

gulp.task("compile:css", () => {
	return gulp.src("css/*.css")
	.pipe(plumber())
	.pipe(cleanCSS({compatibility: "ie8"}))
	.pipe(gulp.dest('dist'));
});

gulp.task("minified", done => {
	runSequence(
		"minified:ts",
		done
	);
});

gulp.task("compile:ts", () => {
	const tsConfig = _.cloneDeep(tsconfig.compilerOptions);
	return gulp
	.src(paths.tscripts.src)
	.pipe(plumber())
	.pipe(tsc(tsConfig))
	.pipe(header(banner, { pkg: pkg }))
	.pipe(gulp.dest(paths.tscripts.dest));
});

gulp.task("minified:ts", () => {
	const tsConfig = _.cloneDeep(tsconfig.compilerOptions);
	tsConfig.out = "ideal-postcodes-autocomplete.min.js";
	
	return gulp
	.src(paths.tscripts.src)
	.pipe(tsc(tsConfig))
	.pipe(uglify())
	.pipe(header(banner, { pkg: pkg }))
	.pipe(gulp.dest(paths.tscripts.dest));
});

gulp.task("compile_test_build", () => {
	const tsConfig = _.cloneDeep(tsconfig.compilerOptions);
	tsConfig.out = "ideal-postcodes-autocomplete.js";
	return gulp
	.src(paths.tscripts.src)
	.pipe(tsc(tsConfig))
	.pipe(gulp.dest(paths.tscripts.testDest));
});

gulp.task("compile_tests", () => {
	return gulp
	.src(testPaths.tscripts.src)
	.pipe(babel({
		presets: ['es2015']
	}))
	.pipe(gulp.dest(testPaths.tscripts.dest));
});

gulp.task("lint:default", () => {
	return gulp.src(paths.tscripts.src)
		.pipe( tslint({ formatting: "prose" }) )
		.pipe( tslint.report({ emitError: true }) );
});

gulp.task("browserstack:integration", done => {
	runSequence(
		"lint", 
		"compile_tests", 
		"compile_test_build",
		"open_browserstack_tunnel",
		"start_browserstack_integration",
		"close_browserstack_tunnel",
		done
	);
});

let bsLocal;

gulp.task("open_browserstack_tunnel", done => {
	bsLocal = new browserstack.Local();
	bsLocal.start({
		key: process.env.BROWSERSTACK_ACCESS_KEY,
		force: true
	}, done);
});

gulp.task("start_browserstack_integration", done => {
  Nightwatch.cli(args => {
  	let launchers = {};
		if (argv.b) {
		  argv.b.split(",").forEach(p => launchers[p] = platforms[p]);
		} else {
		  launchers = platforms;
		}
  	args.config = "test/config/nightwatch.browserstack.js";
  	args.env = Object.keys(launchers).join(",");
  	args.e = Object.keys(launchers).join(",");
    Nightwatch.CliRunner(args)
    	.setup(null, done)
			.runTests(null, done);
  });
});

gulp.task("local_integration", done => {
  Nightwatch.cli(args => {
  	args.config = "test/config/nightwatch.local.js";
    Nightwatch.CliRunner(args)
    	.setup(null, done)
			.runTests(null, done);
  });
});

gulp.task("close_browserstack_tunnel", done => {
	bsLocal.stop(done);
});

gulp.task("unit", done => {
	new KarmaServer({
		configFile: `${__dirname}/test/config/karma.conf.js`,
		singleRun: true
	}, code => {
		if (code === 1) return done("Unit Test Failures");
		done();
	}).start();
});

gulp.task("browserstack:unit", done => {
	new KarmaServer({
		configFile: `${__dirname}/test/config/karma.conf-browserstack.js`,
		singleRun: true
	}, done).start();
});

gulp.task("default", done => {
	runSequence(
		"lint",
		"test",
		"build",
		done
	);
});

gulp.task("build", done => {
	runSequence(
		"compile",
		"minified",
		done
	);
});

gulp.task("lint", ["lint:default"]);

gulp.task("test", done => {
	runSequence(
		"lint", 
		"compile_tests", 
		"compile_test_build",
		"unit",
		done
	);
});

gulp.task("integration", done => {
	runSequence(
		"lint", 
		"compile_tests", 
		"compile_test_build",
		"local_integration",
		done
	);
});

gulp.task("ci", done => {
	runSequence(
		"lint",
		"compile_test_build",
		"browserstack:unit",
		"browserstack:integration",
		done
	);
});

gulp.task("ci:integration", done => {
	runSequence(
		"lint",
		"compile_test_build",
		"browserstack:integration",
		done
	);
});

gulp.task("ci:unit", done => {
	runSequence(
		"lint",
		"compile_test_build",
		"browserstack:unit",
		done
	);
});

gulp.task('test_webserver', () => {
  gulp.src('./')
    .pipe(server({
      livereload: false,
      clientConsole: true
    }));
});

gulp.task('webserver', () => {
  gulp.src('./')
    .pipe(server({
      livereload: true,
      directoryListing: true,
      clientConsole: true,
      open: true
    }));
});
