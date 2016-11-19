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

webServer.start(1337, 'testapikey');

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
            .reply();

        request(webServer)
            .get('/')
            .set('X-Username', 'testuser')
            .expect(200)
            .end(function (err, res) {
                expect(api.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });

    it('should pass the X-User-Password header from the request to TroopTrack', function (done) {

        var api = nock('http://trooptrack.com:443', {
            reqheaders: {
                'X-User-Password': 'testpassword'
            }
        })
            .post('/api/v1/tokens')
            .reply();

        request(webServer)
            .get('/')
            .set('X-User-Password', 'testpassword')
            .expect(200)
            .end(function (err, res) {
                expect(api.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });

    it('should pass the API key it was supplied at startup to TroopTrack', function(done) {

        var api = nock('http://trooptrack.com:443', {
            reqheaders: {
                'X-Partner-Token': 'testapikey'
            }
        })
            .post('/api/v1/tokens')
            .reply();

        request(webServer)
            .get('/')
            .expect(200)
            .end(function (err, res) {
                expect(api.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });

    it('should store the User token retrieved by TroopTrack and use it on a subsequent call to a different endpoint', function(done) {

        var tokenApi = nock('http://trooptrack.com:443', {
            reqheaders: {
                'X-Partner-Token': 'testapikey',
                'X-Username': 'testuser',
                'X-User-Password': 'testpassword'
            }
        })
            .post('/api/v1/tokens')
            .reply(200, {
                "users": [
                    {
                        "token": "testusertoken"
                    }
                ]
            });

        var otherApi = nock('http://trooptrack.com:443', {
            reqheaders: {
                'X-Partner-Token': 'testapikey',
                'X-User-Token': 'testusertoken'
            }
        })
            .get('/api/v1/tokens')
            .reply();

        request(webServer)
            .get('/')
            .set('X-User-Password', 'testpassword')
            .set('X-Username', 'testuser')
            .expect(200)
            .end(function (err, res) {
                expect(tokenApi.isDone()).to.be.true;
                expect(otherApi.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });

});
