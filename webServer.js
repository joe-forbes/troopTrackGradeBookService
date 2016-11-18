/* webServer.js
 * The purpose of webServer.js is to receive, respond to, and route requests.
 */

var express = require('express');
var logger = require("./logger");
var request = require('request');

var webServer = module.exports = express();

function start(port) {
  webServer.listen(port);
  logger.info( "webServer listening on port " + port + ".");

  webServer.get('/', function(req, res) {
    logger.debug("in app.get(). req.headers=", req.headers);


    request.post({url:'http://trooptrack.com:443/api/v1/tokens', form: {key:'value'}}, function(err,httpResponse,body){
      if (!err && httpResponse.statusCode == 200) {
        console.log(body) //write the body to the console
      }
      res.send();
    })

  });

}

module.exports.start = start;