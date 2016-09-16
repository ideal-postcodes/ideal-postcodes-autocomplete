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
	"Input first character": browser => {
		browser
			.click("#input")
      .keys(["1"], function () {
      	browser.expect.element("ul.idpc_ul").to.not.be.visible.before(DEFAULT_TIMEOUT);
	      browser.saveScreenshot(screenshotName(browser, "Input visible but no dropdown"));
      });
	},
	"Input second character": browser => {
		browser
			.keys(["0"], function () {
	      browser.expect.element("ul.idpc_ul").to.be.visible.before(DEFAULT_TIMEOUT);
	      browser.saveScreenshot(screenshotName(browser, "Shows dropdown"))
      });
	},
	"Click on address": browser => {
		browser
			.click("li:first-child", () => {
				browser.expect.element("ul.idpc_ul").to.not.be.visible.before(DEFAULT_TIMEOUT);
				browser.expect.element("#line_1").to.have.value.not.equals("").before(DEFAULT_TIMEOUT);
				browser.expect.element("#post_town").to.have.value.not.equals("").before(DEFAULT_TIMEOUT);
				browser.expect.element("#postcode").to.have.value.not.equals("").before(DEFAULT_TIMEOUT);
				browser.saveScreenshot(screenshotName(browser, "Dropdown disappears and address is inputed"));
			});
	},
	"End": browser => {
		browser.end();
	}
};
