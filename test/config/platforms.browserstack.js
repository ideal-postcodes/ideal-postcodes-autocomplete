"use strict";

module.exports = {
	// OS10

	// OS10.Firefox

	"OSX_FireFox": { 
		base: "BrowserStack",
		browser: "firefox",
		os: "OS X",
		os_version: "Sierra",
		browser_version: "47.0"
	},

	// OS10.Chrome

	"OSX_Chrome": {
		base: "BrowserStack",
		browser: "Chrome",
		browser_version: "52.0",
		os: "OS X",
		os_version: "Sierra"
	},

	// OS10.Safari

	"Safari_6": {
		base: "BrowserStack",
		browser: "Safari",
		os: "OS X",
		os_version: "Mountain Lion",
		browser_version: "6.2"
	},
	"Safari_7": {
		base: "BrowserStack",
		browser: "Safari",
		os: "OS X",
		os_version: "Mavericks",
		browser_version: "7.1"
	},
	"Safari_8": {
		base: "BrowserStack",
		browser: "Safari",
		os: "OS X",
		os_version: "Yosemite",
		browser_version: "8.0"
	},
	"Safari_9": {
		base: "BrowserStack",
		browser: "safari",
		browser_version: "9.0",
		os: "OS X",
		os_version: "El Capitan"
	},

	// Windows

	// Windows.Firefox

	"Windows_FireFox": {
		base: "BrowserStack",
		browser: "firefox",
		os: "Windows",
		os_version: "10",
		browser_version: "47.0"
	},

	"Windows_Chrome": {
		base: "BrowserStack",
		browser: "chrome",
		browser_version: "52.0",
		os: "Windows",
		os_version: "10"
	},

	// Windows.Edge
	"Edge": {
		base: "BrowserStack",
		browser: "Edge",
		browser_version: "13.0",
		os: "Windows",
		os_version: "10"
	},

	// Windows.IE

	// "InternetExplorer_9": {
	// 	base: "BrowserStack",
	// 	browser: "IE",
	// 	browser_version: "9.0",
	// 	os: "Windows",
	// 	os_version: "7"
	// },
	"InternetExplorer_10": {
		base: "BrowserStack",
		browser: "IE",
		browser_version: "10.0",
		os: "Windows",
		os_version: "7"
	},
	"InternetExplorer_11": {
		base: "BrowserStack",
		browser: "IE",
		browser_version: "11.0",
		os: "Windows",
		os_version: "7"
	},

	// Windows.Opera

	"Opera": {
		base: "BrowserStack",
		browser: "Opera",
		os: "Windows",
		os_version: "7",
		browser_version: "12.16"
	},

	// Android

	nexus_5: {
		base: "BrowserStack",
		browserName: "android",
		platform: "ANDROID",
		os: "android",
		os_version: "5.0",
		device: "Google Nexus 5"
	},

	nexus_4: {
		base: "BrowserStack",
		browserName: "android",
		platform: "ANDROID",
		os: "android",
		os_version: "4.2",
		device: "Google Nexus 4"
	},

	nexus: {
		base: "BrowserStack",
		browserName: "android",
		platform: "ANDROID",
		os: "android",
		os_version: "4.0",
		device: "Google Nexus"
	},

	// iOS

	iphone_5s: {
		base: "BrowserStack",
		browserName: "iPhone",
		platform: "MAC",
		os: "ios",
		os_version: "7.0",
		device: "iPhone 5S"
	},

	iphone_6s: {
		base: "BrowserStack",
		browserName: "iPhone",
		platform: "MAC",
		os: "ios",
		os_version: "9.1",
		device: "iPhone 6S"
	}
	
};
