"use strict";

const _ = require("lodash");
const defaults = require("./karma.default.js");
const karma_jasmine_ajax = require("karma-jasmine-ajax");

const browsers = [];

if (process.env.BROWSERS) {
	process.env.BROWSERS.split(",")
		.map(b => b.trim())
		.forEach(b => browsers.push(b));
} else {
	browsers.push("Chrome")
	browsers.push("Firefox");
}

module.exports = config => {
	config.set(_.extend(defaults, {
		browsers: browsers
	}));
};
