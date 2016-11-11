/* webServerTest.js
 * 
 * Test webServer functions.
 * 
 */

var webServer = require('../webServer');
var request = require('supertest');
var logger = require("../logger");

webServer.start(1337);

describe('webServer.js tests', function() {

    it('should have an index route accessible via GET', function(done) {
      request(webServer).get('/').expect(200, done);
    });

});
