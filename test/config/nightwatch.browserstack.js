"use strict";

const path = require("path");
const glob = require("glob");
const extend = require("util")._extend;
const pkg = require("../../package.json");
const testRoot = path.resolve(__dirname, "../");
const files = glob.sync(`${testRoot}/*.integration.js`);
const platforms = require("./platforms.browserstack.js");

const commonCapabilities = {
	"project": pkg.name,
	"build": `${(new Date()).toJSON()} (${pkg.version})`,
	"browserstack.user": process.env.BROWSERSTACK_USERNAME,
	"browserstack.key": process.env.BROWSERSTACK_ACCESS_KEY,
	"browserstack.debug": true,
	"browserstack.local": true,
	"javascriptEnabled": true,
	"acceptSslCerts": true
};

const nightwatchConfig = {
	src_folders: files,
	"output_folder": `${testRoot}/selenium/output/`,
  "custom_commands_path": "",
  "custom_assertions_path": "",
  "page_objects_path": "",
  "globals_path": `${testRoot}/config/nightwatch.globals.js`,

	selenium: {
		"start_process": false,
		"host" : "hub-cloud.browserstack.com",
		"port" : 80
	},

	test_settings: {
		default: {}
	}
};

for (let platform in platforms) {
	let config = extend({}, commonCapabilities);
	config = extend(config, platforms[platform]);
	nightwatchConfig.test_settings[platform] = {
		desiredCapabilities: extend({}, config)
	};
}

// Code to copy seleniumhost/port into test settings
for (let i in nightwatchConfig.test_settings){
	const config = nightwatchConfig.test_settings[i];
	config["selenium_host"] = nightwatchConfig.selenium.host;
	config["selenium_port"] = nightwatchConfig.selenium.port;
}

module.exports = nightwatchConfig;
