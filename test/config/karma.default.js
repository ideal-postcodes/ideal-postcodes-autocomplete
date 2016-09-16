"use strict";

let helpers = [
	"../helpers/*.js",
	"../helpers/xhr_stubbing/*.js",
	"../helpers/xhr_stubbing/responses/*.js"
];

if (!!process.env.LIVE) helpers.push("../config/live_settings.js");

const files = helpers.concat([
	"../../node_modules/jquery/dist/jquery.min.js",
	"../../node_modules/jasmine-jquery/lib/jasmine-jquery.js",
	"../dist/ideal-postcodes-autocomplete.js",
	"../build/*.unit.js",
	{ pattern: "./fixtures/*", included: false }
]);

module.exports = {
	"testName": "ideal-postcodes-autocomplete",
	"basePath": "",
	"frameworks": ["jasmine-ajax", "jasmine"],
	"files": files,
	"colors": true,
	"reporters": ["dots"],
	"port": 9876
};
