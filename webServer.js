/* webServer.js
 * The purpose of webServer.js is to receive, respond to, and route requests.
 */

var express = require('express');
var logger = require("./logger");
var request = require('request');

var webServer = module.exports = express();

function start(port, partnerToken) {
    webServer.listen(port);
    logger.info("webServer listening on port " + port + ".");

    webServer.get('/', function (req, res) {
        logger.debug("in app.get(). req.headers=", req.headers);

        var requestOptions = {
            url: 'http://trooptrack.com:443/api/v1/tokens',
            headers: {
                'X-Partner-Token': partnerToken,
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
                    afterToken(req, res, body);
                } else {
                    logger.error({'httpResponse': httpResponse});
                    res.send(500);
                }
            }
        })

    });

    function afterToken(req, res, body){
        console.log(body); //write the body to the console
        var jsonBody = JSON.parse(body);
        var requestOptions = {
            url: 'http://trooptrack.com:443/api/v1/tokens',
            headers: {
                'X-Partner-Token': partnerToken,
                'X-User-Token': jsonBody.users[0].token
            }
        }
        request.get(requestOptions, function (err, httpResponse, body) {
            if (err) {
                logger.error({'err': err});
                res.send(500);
            } else {
                if (httpResponse.statusCode == 200) {
                    res.send(body);
                } else {
                    logger.error({'httpResponse': httpResponse});
                    res.send(500);
                }
            }
        })
    }
}

module.exports.start = start;