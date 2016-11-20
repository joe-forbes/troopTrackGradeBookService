/*
 * server.js - main entry point for the application
 * The purpose of server.js is to read configuration from configuration sources 
 * (defaults, command-line, options files, and so on)
 * and start the webServer.
 * here we are....
 */

try {
    var util = require("util");
    var os = require('os');
    var logger = require("./logger");
    var configger = require("./configger");
    var webServer = require('./webServer');
    var packageJson = require('./package.json');
} catch (e) {
    console.log("Error initializing application", e);
    return;
}

var config = configger.load({
    http: {port: 8080},
    apiTokenFile: os.homedir() + '/Keys/troopTrackApi'
});

var fs = require('fs');
var apiToken = fs.readFileSync(config.apiTokenFile).toString().trim();

logger.addTargets(config.loggingTargets);

logger.info("app version: " + packageJson.version);
logger.debug("config: " + util.inspect(config, {depth: null}));
logger.debug("package.json: " + util.inspect(packageJson, {depth: null}));

webServer.start(config.webServer.port, apiToken);
