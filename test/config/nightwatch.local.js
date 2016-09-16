"use strict";

const path = require("path");
const glob = require("glob");
const testRoot = path.resolve(__dirname, "../");
const files = glob.sync(`${testRoot}/*.integration.js`);

module.exports = {
	"src_folders": files,
	"output_folder": `${testRoot}/selenium/output/`,
	"custom_commands_path": "",
	"custom_assertions_path": "",
	"page_objects_path": "",
	"globals_path": `${testRoot}/config/nightwatch.globals.js`,

	"selenium" : {
		"start_process": true,
		"server_path": process.env.SELENIUM_PATH || "",
		"log_path": `${testRoot}/selenium/logs/`,
		"host": "127.0.0.1",
		"port": 4444,
		"cli_args": {
			"webdriver.chrome.args": "--disable-web-security",
			"webdriver.chrome.driver": ""
		}
	},

	"test_settings": {
		"default": {
			"launch_url": "http://127.0.0.1",
			"selenium_port": 4444,
			"selenium_host": "localhost",
			"silent": true,
			"screenshots": {
				"enabled": false,
				"path": ""
			},
			"desiredCapabilities": {
				"browserName": "chrome",
				"javascriptEnabled": true,
				"acceptSslCerts": true
			}
		}
	}
};
