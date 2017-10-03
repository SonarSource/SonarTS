var webpack = require('./webpack.config.js');

module.exports = function (config) {
	config.set({
		browsers: ['PhantomJS'],
		frameworks: ['jasmine'],
		reporters: ['progress'],

		files: [
			{pattern: 'tests.webpack.ts', watched: false}
		],

		preprocessors: {
			'tests.webpack.ts': ['webpack']
		},

		webpack: {
			resolve: webpack.resolve,
			module: webpack.module,
			watch: true
		},

		webpackServer: {
			noInfo: true
		}
	});
};
