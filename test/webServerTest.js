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

describe('webServer.js tests', function () {

    it('should have an index route accessible via GET', function (done) {
        var api = nock('http://trooptrack.com:443')
            .post('/api/v1/tokens')
            .reply(200, {
                "status": 200,
                "message": "This is a mocked response"
            });

        request(webServer).get('/').expect(200, done);
    });


    it('should make a POST call to TroopTrack server to get the token', function (done) {

        var api = nock('http://trooptrack.com:443')
            .post('/api/v1/tokens')
            .reply(200, {
                "status": 200,
                "message": "This is a mocked response"
            });

        request(webServer).get('/').expect(200)
            .end(function (err, res) {
                expect(api.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });
    });

    it('should return an error if the response from TroopTrack API has non-200 statusCode.', function (done) {

        var api = nock('http://trooptrack.com:443')
            .post('/api/v1/tokens')
            .reply(500, {
                "status": 500,
                "message": "This is a mocked response"
            });

        request(webServer).get('/').expect(500)
            .end(function (err, res) {
                expect(api.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });

    it('should return an error if the response from TroopTrack API is an error', function (done) {

        var api = nock('http://trooptrack.com:443')
            .post('/api/v1/tokens')
            .replyWithError('Danger, Will Robinson');

        request(webServer).get('/').expect(500)
            .end(function (err, res) {
                expect(api.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });


    it('should pass the X-Username header from the request to TroopTrack', function (done) {

        var api = nock('http://trooptrack.com:443', {
            reqheaders: {
                'X-Username': 'testuser'
            }
        })
            .post('/api/v1/tokens')
            .replyWithError('Danger, Will Robinson');

        request(webServer)
            .get('/')
            .set('X-Username', 'testuser')
            .expect(500)
            .end(function (err, res) {
                expect(api.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });

});
