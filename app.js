/**
 * Created by joe on 11/20/16.
 */


/*
 * app.js - startup activities for the application
 * The purpose of app.js is to read configuration from configuration sources
 * (defaults, command-line, options files, and so on)
 * and start the webServer.
 *
 * It is separate from server.js in order to support testing; in order to test the code,
 * something has to "require" it, so allowing the startup routines to run automatically on "require"
 * complicates matters.
 */

function start() {

    var configger = require("./configger");
    var os = require('os');

    var config = configger.load({
        webServer: {port: 8080},
        apiTokenFile: os.homedir() + '/Keys/troopTrackApi'
    });

    var logger = require("./logger");
    var packageJson = require('./package.json');
    var util = require("util");

    logger.addTargets(config.loggingTargets);
    logger.info("app version: " + packageJson.version);
    logger.debug("config: " + util.inspect(config, {depth: null}));
    logger.debug("package.json: " + util.inspect(packageJson, {depth: null}));

    var fs = require('fs');
    var apiToken = fs.readFileSync(config.apiTokenFile).toString().trim();

    var webServer = require('./webServer');
    webServer.start(config.webServer.port, apiToken);
}

module.exports.start = start;