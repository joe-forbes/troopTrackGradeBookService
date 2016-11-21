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

    var tokenApi = nock('https://trooptrack.com:443', {
        reqheaders: {
            'X-Partner-Token': 'testapikey',
            'X-Username': 'testuser',
            'X-User-Password': 'testpassword'
        }
    })
        .persist()
        .post('/api/v1/tokens')
        .reply(201, {
            "users": [
                {
                    "token": "testusertoken"
                }
            ]
        });

    var otherApi = nock('https://trooptrack.com:443', {
        reqheaders: {
            'X-Partner-Token': 'testapikey',
            'X-User-Token': 'testusertoken'
        }
    })
        .persist()
        .get('/api/v1/tokens')
        .reply();

    it('should have an index route accessible via GET', function (done) {

        request(webServer)
            .get('/')
            .set('X-User-Password', 'testpassword')
            .set('X-Username', 'testuser')
            .expect(200, done);

    });


    it('should make a POST call to TroopTrack server to get the token', function (done) {

        request(webServer)
            .get('/')
            .set('X-User-Password', 'testpassword')
            .set('X-Username', 'testuser')
            .expect(200)
            .end(function (err, res) {
                expect(tokenApi.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });
    });

    it('should return an error if the response from TroopTrack API has non-201 statusCode.', function (done) {

        var api = nock('https://trooptrack.com:443')
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

        var api = nock('https://trooptrack.com:443')
            .post('/api/v1/tokens')
            .replyWithError('Danger, Will Robinson');

        request(webServer).get('/').expect(500)
            .end(function (err, res) {
                expect(api.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });

    it('should return an error if the response from TroopTrack API has statusCode 500.', function (done) {

        var api = nock('https://trooptrack.com:443')
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

    it('should pass the correct headers to TroopTrack', function (done) {

        request(webServer)
            .get('/')
            .set('X-Username', 'testuser')
            .set('X-User-Password', 'testpassword')
            .expect(200)
            .end(function (err, res) {
                expect(tokenApi.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });

    it('should store the User token retrieved by TroopTrack and use it on a subsequent call to a different endpoint', function(done) {

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

    it('should return an error if the second call to TroopTrack results in non-200 status code', function(done) {

        var myTokenApi = nock('https://trooptrack.com:443', {
            reqheaders: {
                'X-Partner-Token': 'testapikey',
                'X-Username': 'mytestuser',
                'X-User-Password': 'testpassword'
            }
        })
            .post('/api/v1/tokens')
            .reply(201, {
                "users": [
                    {
                        "token": "mytestusertoken"
                    }
                ]
            });

        var myOtherApi = nock('https://trooptrack.com:443', {
            reqheaders: {
                'X-Partner-Token': 'testapikey',
                'X-User-Token': 'mytestusertoken'
            }
        })
            .get('/api/v1/tokens')
            .reply(500, {
                "status": 500,
                "message": "This is a mocked response"
            });

        request(webServer)
            .get('/')
            .set('X-User-Password', 'testpassword')
            .set('X-Username', 'mytestuser')
            .expect(500)
            .end(function (err, res) {
                expect(myTokenApi.isDone()).to.be.true;
                expect(myOtherApi.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });

    it('should return an error if the second call to TroopTrack results in an error', function(done) {

        var myTokenApi = nock('https://trooptrack.com:443', {
            reqheaders: {
                'X-Partner-Token': 'testapikey',
                'X-Username': 'mytestuser',
                'X-User-Password': 'testpassword'
            }
        })
            .post('/api/v1/tokens')
            .reply(201, {
                "users": [
                    {
                        "token": "mytestusertoken"
                    }
                ]
            });

        var myOtherApi = nock('https://trooptrack.com:443', {
            reqheaders: {
                'X-Partner-Token': 'testapikey',
                'X-User-Token': 'mytestusertoken'
            }
        })
            .get('/api/v1/tokens')
            .replyWithError("Danger, Will Robinson!");

        request(webServer)
            .get('/')
            .set('X-User-Password', 'testpassword')
            .set('X-Username', 'mytestuser')
            .expect(500)
            .end(function (err, res) {
                expect(myTokenApi.isDone()).to.be.true;
                expect(myOtherApi.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });

    it('should return an error if the call to get the User Token from TroopTrack does not contain a token', function(done) {

        var myTokenApi = nock('https://trooptrack.com:443', {
            reqheaders: {
                'X-Partner-Token': 'testapikey',
                'X-Username': 'mytestuser',
                'X-User-Password': 'testpassword'
            }
        })
            .post('/api/v1/tokens')
            .reply(201, {
                "fusers": [
                    {
                        "foo": "mytestusertoken"
                    }
                ]
            });

        request(webServer)
            .get('/')
            .set('X-User-Password', 'testpassword')
            .set('X-Username', 'mytestuser')
            .expect(500)
            .end(function (err, res) {
                expect(myTokenApi.isDone()).to.be.true;
                if (err) return done(err);
                done();
            });

    });


});
