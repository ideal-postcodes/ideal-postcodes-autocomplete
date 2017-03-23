"use strict";

const platformFilter = (process.env.PLATFORMS || process.env.PLATFORM || "")
	.split(",")
	.filter(elem => elem)
	.map(elem => elem.toLowerCase());

const platforms = {
	// Requires LIVE=true due to incompatible stubbing lib
	// "windows.ie.9": {
	// 	base: "BrowserStack",
	// 	browser: "IE",
	// 	browser_version: "9.0",
	// 	os: "Windows",
	// 	os_version: "7"
	// },
	// "windows.opera.12.16": {
	// 	base: "BrowserStack",
	// 	browser: "Opera",
	// 	os: "Windows",
	// 	os_version: "7",
	// 	browser_version: "12.16"
	// },

	"osx.firefox.47": { 
		base: "BrowserStack",
		browser: "firefox",
		os: "OS X",
		os_version: "Sierra",
		browser_version: "47.0"
	},
	"osx.chrome.52": {
		base: "BrowserStack",
		browser: "Chrome",
		browser_version: "52.0",
		os: "OS X",
		os_version: "Sierra"
	},
	"osx.safari.6": {
		base: "BrowserStack",
		browser: "Safari",
		os: "OS X",
		os_version: "Mountain Lion",
		browser_version: "6.2"
	},
	"osx.safari.7": {
		base: "BrowserStack",
		browser: "Safari",
		os: "OS X",
		os_version: "Mavericks",
		browser_version: "7.1"
	},
	"osx.safari.8": {
		base: "BrowserStack",
		browser: "Safari",
		os: "OS X",
		os_version: "Yosemite",
		browser_version: "8.0"
	},
	"osx.safari.9": {
		base: "BrowserStack",
		browser: "safari",
		browser_version: "9.0",
		os: "OS X",
		os_version: "El Capitan"
	},
	"windows.firefox.47": {
		base: "BrowserStack",
		browser: "firefox",
		os: "Windows",
		os_version: "10",
		browser_version: "47.0"
	},
	"windows.chrome.52": {
		base: "BrowserStack",
		browser: "chrome",
		browser_version: "52.0",
		os: "Windows",
		os_version: "10"
	},
	"windows.chrome.49": {
		base: "BrowserStack",
		browser: "chrome",
		browser_version: "49.0",
		os: "Windows",
		os_version: "10"
	},
	"windows.edge.14": {
		base: "BrowserStack",
		browser: "Edge",
		browser_version: "14.0",
		os: "Windows",
		os_version: "10"
	},
	"windows.edge.13": {
		base: "BrowserStack",
		browser: "Edge",
		browser_version: "13.0",
		os: "Windows",
		os_version: "10"
	},
	"windows.ie.10": {
		base: "BrowserStack",
		browser: "IE",
		browser_version: "10.0",
		os: "Windows",
		os_version: "7"
	},
	"windows.ie.11": {
		base: "BrowserStack",
		browser: "IE",
		browser_version: "11.0",
		os: "Windows",
		os_version: "7"
	},
	"windows.opera.43": {
		base: "BrowserStack",
		browser: "Opera",
		os: "Windows",
		os_version: "10",
		browser_version: "43"
	},
	"android.galaxy.4.4": {
		base: "BrowserStack",
		browserName: "android",
		platform: "ANDROID",
		os: "android",
		os_version: "4.4",
		device: "Samsung Galaxy S5"
	},
	"android.nexus.4.2": {
		base: "BrowserStack",
		browserName: "android",
		platform: "ANDROID",
		os: "android",
		os_version: "4.2",
		device: "Google Nexus 4"
	},
	"android.nexus.4.0": {
		base: "BrowserStack",
		browserName: "android",
		platform: "ANDROID",
		os: "android",
		os_version: "4.0",
		device: "Google Nexus"
	},
	"ios.iphone.5s.7.0": {
		base: "BrowserStack",
		browserName: "iPhone",
		platform: "MAC",
		os: "ios",
		os_version: "7.0",
		device: "iPhone 5S"
	},
	"ios.iphone.6s.9.1": {
		base: "BrowserStack",
		browserName: "iPhone",
		platform: "MAC",
		os: "ios",
		os_version: "9.1",
		device: "iPhone 6S"
	}	
};

const exportedPlatforms = {};

// Match specific combination, OS, or browser type
platformFilter.forEach(platform => {
	Object.keys(platforms).forEach(availablePlatform => {
		const platformConfig = platforms[availablePlatform];
		const matchesFilter = [
			availablePlatform.toLowerCase(),
			(platformConfig.os || "").toLowerCase(),
			(platformConfig.browserName || "").toLowerCase(),
			(platformConfig.browser || "").toLowerCase()
		].some(test => test === platform);
		if (matchesFilter) exportedPlatforms[availablePlatform] = platformConfig;
	});
});

module.exports = Object.keys(exportedPlatforms).length > 0 ? exportedPlatforms : platforms;
