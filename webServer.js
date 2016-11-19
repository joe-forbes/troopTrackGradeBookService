/* webServer.js
 * The purpose of webServer.js is to receive, respond to, and route requests.
 */

var express = require('express');
var logger = require("./logger");
var request = require('request');

var webServer = module.exports = express();

function start(port) {
    webServer.listen(port);
    logger.info("webServer listening on port " + port + ".");

    webServer.get('/', function (req, res) {
        logger.debug("in app.get(). req.headers=", req.headers);

        var requestOptions = {
            url: 'http://trooptrack.com:443/api/v1/tokens',
            headers: {
                'X-Username': req.header('X-Username'),
                'X-User-Password': req.header('X-User-Password')
            }
        }

        request.post(requestOptions, function (err, httpResponse, body) {
            if (err) {
                logger.error({'err': err});
                res.send(500);
            } else {
                if (httpResponse.statusCode == 200) {
                    console.log(body); //write the body to the console
                    res.send();
                } else {
                    logger.error({'httpResponse': httpResponse});
                    res.send(500);
                }
            }
        })

    });

}

module.exports.start = start;