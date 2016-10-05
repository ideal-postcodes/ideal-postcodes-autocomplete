"use strict";

const _ = require("lodash");
const argv = require('optimist').argv;
const pkg = require("../../package.json");
const defaults = require("./karma.default.js");
const username = process.env.BROWSERSTACK_USERNAME;
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;
const platforms = require("./platforms.browserstack.js");

let launchers = {};
if (argv.b) {
  argv.b.split(",").forEach(p => launchers[p] = platforms[p]);
} else {
  launchers = platforms;
}

module.exports = config => {
  config.set(_.extend(defaults, {
    logLevel: config.LOG_INFO,
    browserStack: {
      project: pkg.name,
      username: username,
      accessKey: accessKey,
      build: `${Date.now()}-${pkg.version}`
    },
    captureTimeout: 120000,
    customLaunchers: launchers,
    browsers: Object.keys(launchers),
    singleRun: true
  }));
};
