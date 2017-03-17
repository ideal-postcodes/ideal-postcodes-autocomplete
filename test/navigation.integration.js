"use strict";

const DEFAULT_TIMEOUT = 2000;
const helpers = require("./selenium/helpers/index.js");
const screenshotName = helpers.screenshotName(module.filename);

module.exports = {
	"Load autocomplete": browser => {
		browser
			.url("http://localhost:8000/example/index.html")
			.waitForElementVisible("body", DEFAULT_TIMEOUT, function () {
				this.assert.containsText("body", "Ideal Postcodes Autocomplete");
				this.assert.elementPresent("div.idpc_autocomplete");
				this.assert.elementPresent("ul.idpc_ul");
				browser.expect.element("ul.idpc_ul").to.not.be.visible;
				this.assert.cssClassPresent("ul.idpc_ul", "hidden");
				browser.saveScreenshot(screenshotName(browser, "Dropdown not visible"));
			});
	},
	"Retrieve suggestions": browser => {
		browser
			.click("#input")
			.keys(["1", "0"], function () {
	      browser.expect.element("ul.idpc_ul").to.be.visible.before(DEFAULT_TIMEOUT);
	      browser.saveScreenshot(screenshotName(browser, "Shows dropdown"))
      });
	},
	"Scrolling down": browser => {
		for (let i = 0; i < 10; i++) {
			browser
				.keys(browser.Keys.DOWN_ARROW, function () {
					browser.expect.element(`li:nth-child(${i + 1})`)
						.to.have.attribute("aria-selected")
						.which.equals("true");
					browser.screenshot(screenshotName(browser, `On down button selects ${i+1}th item`));
				});
		}
		browser.keys(browser.Keys.DOWN_ARROW, function () {
			browser.expect.element("li:nth-child(1)")
				.to.have.attribute("aria-selected")
				.which.equals("true");
		});
	},
	"Scrolling up": browser => {
		for (let i = 9; i >= 0; i--) {
			browser
				.keys(browser.Keys.UP_ARROW, function () {
					browser.expect.element(`li:nth-child(${i + 1})`)
						.to.have.attribute("aria-selected")
						.which.equals("true");
				});
		}
		browser.keys(browser.Keys.UP_ARROW, function () {
			browser.expect.element("li:nth-child(10)")
				.to.have.attribute("aria-selected")
				.which.equals("true");
		});
	},
	"Blur": browser => {
		browser.doubleClick("#title", function () {
			browser.expect.element("ul.idpc_ul").to.not.be.visible.after(DEFAULT_TIMEOUT);
		});
	},
	"Re Focus": browser => {
		browser
			.click("#input")
			.keys(["1"], function () {
	      browser.expect.element("ul.idpc_ul").to.be.visible.before(DEFAULT_TIMEOUT);
      });
	},
	"Escape button": browser => {
		browser.keys(browser.Keys.ESCAPE, function () {
			browser.expect.element("ul.idpc_ul").to.not.be.visible;
		});
	},
	"Focus": browser => {
		browser.doubleClick("#title", function () {
			browser.click("#input", function () {
				browser.expect.element("ul.idpc_ul").to.be.visible.after(DEFAULT_TIMEOUT);
			});
		});
	},
	"End": browser => {
		browser.end();
	}
};
