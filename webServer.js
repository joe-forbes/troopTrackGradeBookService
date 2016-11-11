/* webServer.js
 * The purpose of webServer.js is to receive, respond to, and route requests.
 */

var express = require('express');
var logger = require("./logger");

var webServer = module.exports = express();

function start(port) {
  webServer.listen(port);
  logger.info( "webServer listening on port " + port + ".");

  webServer.get('/', function(req, res) {
    logger.debug("in app.get(). req.headers=", req.headers);
    res.send("");
  });  
}

module.exports.start = start;