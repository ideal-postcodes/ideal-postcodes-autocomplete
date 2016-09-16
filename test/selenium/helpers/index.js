"use strict";

const path = require("path");

const leftPad = number => {
	let result = number.toString();
	const requiredLength = 3;
	while (result.length < requiredLength) {
		result = "0" + result;
	}
	return result;
};

const screenshotName = file => {
	let counter = 0;
	const filename = path.basename(file).replace(".integration.js", "");
	return (browser, name) => {
		counter += 1;
		const platform = browser.options.desiredCapabilities.platform;
		const browserName = browser.options.desiredCapabilities.browserName;
		let label = `${platform}-${browserName}-${filename}-${leftPad(counter)}`;
		if (name) label += `-${name}`;
		return `./test/selenium/screenshots/${label}.png`;
	}
};

module.exports = {
	leftPad: leftPad,
	screenshotName: screenshotName
};
