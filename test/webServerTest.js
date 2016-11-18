/* webServerTest.js
 * 
 * Test webServer functions.
 * 
 */

var nock = require('nock');
var expect = require('chai').expect;
var webServer = require('../webServer');
var request = require('supertest');

var logger = require("../logger");

webServer.start(1337);

var api = nock('http://trooptrack.com:443').persist()
    .post('/api/v1/tokens')
    .reply(200, {
        "status": 200,
        "message": "This is a mocked response"
    });

describe('webServer.js tests', function() {

    it('should have an index route accessible via GET', function(done) {
      request(webServer).get('/').expect(200, done);
    });


    it('should make a POST call to TroopTrack server to get the token', function(done) {

        request(webServer).get('/').expect(200)
            .end(function(err, res) {
                expect(api.isDone()).to.be.true;
                done();
            });
    });
});
