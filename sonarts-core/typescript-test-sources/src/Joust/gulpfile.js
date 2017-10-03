const gulp = require("gulp");
const gutil = require("gulp-util");
const gfile = require("gulp-file");
const plumber = require("gulp-plumber");

const sourcemaps = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const _ = require("lodash");
const through = require("through2");

const webpack = require("webpack");
const webpackStream = require("webpack-stream");

const filter = require("gulp-filter");
const livereload = require("gulp-livereload");

const gitDescribe = require("git-describe").gitDescribe;

const download = require("gulp-download");

const Sentry = require('sentry-api').Client;
const fs = require("fs");
const path = require("path");

gulp.task("default", ["watch"]);

gulp.task("compile", ["compile:web"]);
gulp.task("compile:web", ["compile:scripts:web", "compile:styles", "html:web", "assets", "version:write"]);
gulp.task("compile:dev", ["compile:scripts:dev", "compile:styles", "html:dev", "assets"]);

gulp.task("compile:scripts", ["compile:scripts:web"]);

gulp.task("compile:scripts:web", ["env:set-release"], function () {
	const config = require("./webpack.config.js");
	config.entry = {joust: config.entry.joust}; // remove all bundles but joust
	config.target = "web";
	config.plugins = config.plugins.concat([
		new webpack.optimize.UglifyJsPlugin({
			comments: false,
			compress: {
				warnings: false,
			},
			sourceMap: true,
		}),
		new webpack.BannerPlugin({banner: "Joust " + process.env.JOUST_RELEASE + "\n" + "https://github.com/HearthSim/Joust"}),
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
	]);
	config.devtool = "#source-map";
	return gulp.src("ts/run.ts")
		.pipe(webpackStream(config, webpack))
		.pipe(gulp.dest("dist/"));
});

gulp.task("compile:scripts:dev", function () {
	return gulp.src("ts/run.ts")
		.pipe(webpackStream(require("./webpack.config.js"), webpack))
		.pipe(gulp.dest("dist/"));
});

gulp.task("compile:styles", function () {
	return gulp.src("less/joust.less")
		.pipe(plumber(function(err) {
			gutil.log(gutil.colors.red(err));
			this.emit("end", new gutil.PluginError(err));
		}))
		.pipe(sourcemaps.init())
		.pipe(less({"strictMath": true}))
		.pipe(postcss([
			autoprefixer({
				browsers: ["last 2 versions"],
				remove: false
			}),
			cssnano()
		]))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("dist/"))
		.pipe(filter(["**/*.css"]))
		.pipe(livereload());
});

gulp.task("env:set-release", function (cb) {
	gitDescribe({
		match: null,
	}, function (error, gitInfo) {
		var release = "unknown";
		if (!error) {
			release = gitInfo.semverString;
		}
		else {
			gutil.log(gutil.colors.yellow("Warning: could not determine release"));
		}
		gutil.log("Setting JOUST_RELEASE to", gutil.colors.green(release));
		process.env.JOUST_RELEASE = release;
		cb();
	});
});

gulp.task("version:write", ["env:set-release"], function() {
	const version = process.env.JOUST_RELEASE;
	return gfile("VERSION", version, {src: true})
		.pipe(gulp.dest("dist/"));
});

gulp.task("sentry:release", ["env:set-release"], function () {
	var version = process.env.JOUST_RELEASE;
	var key = "SENTRY_TOKEN";
	var token = process.env[key];
	if (!token) {
		throw Error("Sentry Token not found (expected environment variable " + key + ")");
	}
	var sentry = new Sentry({token: token});
	var prefix = process.env.SENTRY_FILE_PREFIX ? process.env.SENTRY_FILE_PREFIX : "";

	return sentry.releases.create("hearthsim", "joust", {
		version: version,
		ref: version,
	}).then(function (release) {
		gutil.log("Created Sentry release", gutil.colors.green(release.version));

		var files = ["dist/joust.css", "dist/joust.css.map", "dist/joust.js", "dist/joust.js.map"];
		var uploads = files.map(function (file) {
			return sentry.releases.createFile("hearthsim", "joust", version, {
				name: prefix + path.basename(file),
				file: fs.createReadStream(file)
			}).then(function (newFile) {
				gutil.log("Uploaded", gutil.colors.green(newFile.name), "to Sentry");
			}).catch(function (error) {
				throw new Error("Error uploading file " + file + ": " + error.message);
			});
		});

		return Promise.all(uploads);
	}).then(function () {
		gutil.log("Release successful");
	}).catch(function (error) {
		if (error.message === "Release with version already exists") {
			gutil.log(gutil.colors.yellow("Warning: Sentry release already exists, skipping upload"));
			return;
		}
		throw new Error("Error creating Sentry release: " + error.message);
	});
});

gulp.task("html", ["html:dev"]);

gulp.task("html:dev", function () {
	return gulp.src("html/**/*.html")
		.pipe(gulp.dest("dist/"));
});

gulp.task("html:web", function () {
	return gulp.src("html/index.html")
		.pipe(gulp.dest("dist/"));
});

gulp.task("assets", function () {
	return gulp.src("assets/**/*.*")
		.pipe(gulp.dest("dist/assets/"));
});

gulp.task("watch", ["watch:styles", "watch:html", "watch:assets"], function () {
	livereload.listen();
	gutil.log(gutil.colors.yellow("Warning: not compiling or watching TypeScript files"));
	gutil.log(gutil.colors.yellow('Use "webpack --watch -d" for development'));
});

gulp.task("watch:styles", ["compile:styles"], function () {
	return gulp.watch(["less/**/*.less"], ["compile:styles"]);
});

gulp.task("watch:html", ["html"], function () {
	return gulp.watch(["html/**/*.html"], ["html"]);
});

gulp.task("watch:assets", ["assets"], function () {
	return gulp.watch(["assets/**/*.*"], ["assets"]);
});

gulp.task("enums", function () {
	gutil.log(gutil.colors.red('"gulp enums" has been split up in "gulp:enums:download" (preferred) and "gulp:enums:generate" (legacy)'));
});

gulp.task("enums:download", function () {
	download("https://api.hearthstonejson.com/v1/enums.d.ts").pipe(gulp.dest("ts/"))
});

gulp.task("enums:download:json", function () {
	download("https://api.hearthstonejson.com/v1/enums.json").pipe(gulp.dest("./"));
});

gulp.task("enums:generate:download", ["enums:download:json", "enums:generate"]);

gulp.task("enums:generate", function () {
	return gulp.src(process.env.ENUMS_JSON || "enums.json")
		.pipe(through.obj(function (file, encoding, callback) {
			gutil.log("Reading enums from", gutil.colors.magenta(file.path));
			var json = String(file.contents);
			var out = "// this file was automatically generated by `gulp enums`\n";
			out += "// enums.json can be obtained from https://api.hearthstonejson.com/v1/enums.json\n";
			var enums = JSON.parse(json);
			_.each(enums, function (keys, name) {
				out += "\nexport const enum " + name + " {\n";
				foo = [];
				_.each(keys, function (value, key) {
					foo.push("\t" + key + " = " + value);
				});
				out += foo.join(",\n") + "\n";
				out += "}\n";
				gutil.log("Found enum", '"' + gutil.colors.cyan(name) + '"', "with", gutil.colors.magenta(foo.length, "members"));
			});
			file.path = "enums.d.ts";
			file.contents = new Buffer(out);
			gutil.log("Writing to", gutil.colors.magenta(file.path));
			callback(null, file);
		}))
		.pipe(gulp.dest("ts/"));
});
