/**
 * Created by joe on 11/22/16.
 * 
 * Tests for app.js
 */

var expect = require('chai').expect;
var logger = require("../logger");
var os = require('os');

var mockRequire = require('mock-require');

var app = require('../app');
var path = require('path');

describe('app.js tests', function () {

    it('should read configuration from config.json and partner key from ~/Keys/troopTrackApi by default', function (done) {
        var mockFs = require('mock-fs');

        var passedPort = '';
        var passedPartnerToken = '';

        var config = {
            "webServer": {
                "port": 668
            },
            "loggingTargets": []
        };

        var defaultKeyFileFolder = path.relative('', os.homedir() + '/Keys');

        mockRequire('../webServer', {
            start : function(port, partnerToken) {
                passedPort = port;
                passedPartnerToken = partnerToken;
            }
        });

        mockFsConfig = { 'config.json' : JSON.stringify(config) };
        mockFsConfig[defaultKeyFileFolder] = {'troopTrackApi': 'testkey'};
        mockFs(mockFsConfig);

        app.start();

        mockFs.restore();

        expect(passedPort).to.equal(668);
        expect(passedPartnerToken).to.equal('testkey');

        done();
    });

    it('should throw an error if the configuration file cannot be found', function (done) {
        var mockFs = require('mock-fs');

        var passedPort = '';
        var passedPartnerToken = '';

        var config = {
            "webServer": {
                "port": 668
            },
            "loggingTargets": []
        };

        var defaultKeyFileFolder = path.relative('', os.homedir() + '/Keys');

        mockRequire('../webServer', {
            start : function(port, partnerToken) {
                passedPort = port;
                passedPartnerToken = partnerToken;
            }
        });

        mockFsConfig = { 'configOops.json' : JSON.stringify(config) };
        mockFsConfig[defaultKeyFileFolder] = {'troopTrackApi': 'testkey'};
        mockFs(mockFsConfig);

        var errorOccurred = false;

        try {
            app.start();
        } catch (err) {
            errorOccurred = true;
        }

        mockFs.restore();

        expect(errorOccurred).to.be.true;

        done();
    });

    it('should read configuration from file specified in environment variable', function (done) {
        var mockFs = require('mock-fs');

        var passedPort = '';
        var passedPartnerToken = '';

        var config = {
            "webServer": {
                "port": 668
            },
            "loggingTargets": []
        };

        var config2 = {
            "webServer": {
                "port": 664
            },
            "loggingTargets": []
        };

        var defaultKeyFileFolder = path.relative('', os.homedir() + '/Keys');

        mockRequire('../webServer', {
            start : function(port, partnerToken) {
                passedPort = port;
                passedPartnerToken = partnerToken;
            }
        });

        mockFsConfig = { 'config.json' : JSON.stringify(config) };
        mockFsConfig[defaultKeyFileFolder] = {'troopTrackApi': 'testkey', 'otherConfig.json' : JSON.stringify(config2)};
        mockFs(mockFsConfig);

        process.env.configFile = os.homedir() + '/Keys/otherConfig.json';

        app.start();

        delete process.env.configFile;

        mockFs.restore();

        expect(passedPort).to.equal(664);
        expect(passedPartnerToken).to.equal('testkey');

        done();
    });

    it('should read configuration from file specified on command line', function (done) {
        var mockFs = require('mock-fs');

        var passedPort = '';
        var passedPartnerToken = '';

        var config = {
            "webServer": {
                "port": 668
            },
            "loggingTargets": []
        };

        var config2 = {
            "webServer": {
                "port": 662
            },
            "loggingTargets": []
        };

        var defaultKeyFileFolder = path.relative('', os.homedir() + '/Keys');

        mockRequire('../webServer', {
            start : function(port, partnerToken) {
                passedPort = port;
                passedPartnerToken = partnerToken;
            }
        });

        mockFsConfig = { 'config.json' : JSON.stringify(config) };
        mockFsConfig[defaultKeyFileFolder] = {'troopTrackApi': 'testkey', 'anotherConfig.json' : JSON.stringify(config2)};
        mockFs(mockFsConfig);

        process.argv[process.argv.length] = '--configFile';
        process.argv[process.argv.length] = os.homedir() + '/Keys/anotherConfig.json';

        app.start();

        process.argv.splice(process.argv.length - 2, 2);

        mockFs.restore();

        expect(passedPort).to.equal(662);
        expect(passedPartnerToken).to.equal('testkey');

        done();
    });

    it('should use port 8080 if not specified in config file', function (done) {
        var mockFs = require('mock-fs');

        var passedPort = '';
        var passedPartnerToken = '';

        var config = {
            "loggingTargets": []
        };

        var defaultKeyFileFolder = path.relative('', os.homedir() + '/Keys');

        mockRequire('../webServer', {
            start : function(port, partnerToken) {
                passedPort = port;
                passedPartnerToken = partnerToken;
            }
        });

        mockFsConfig = { 'config.json' : JSON.stringify(config) };
        mockFsConfig[defaultKeyFileFolder] = {'troopTrackApi': 'testkey'};
        mockFs(mockFsConfig);

        app.start();

        mockFs.restore();

        expect(passedPort).to.equal(8080);
        expect(passedPartnerToken).to.equal('testkey');

        done();
    });

    it('should read partnerToken from file specified in config', function (done) {

        var mockFs = require('mock-fs');

        var passedPort = '';
        var passedPartnerToken = '';

        var config = {
            "apiTokenFile": os.homedir() + '/Keys/troopTrackPartnerKey',
            "webServer": {
                "port": 668
            },
            "loggingTargets": []
        };

        var defaultKeyFileFolder = path.relative('', os.homedir() + '/Keys');

        mockRequire('../webServer', {
            start : function(port, partnerToken) {
                passedPort = port;
                passedPartnerToken = partnerToken;
            }
        });

        mockFsConfig = { 'config.json' : JSON.stringify(config) };
        mockFsConfig[defaultKeyFileFolder] = {'troopTrackApi': 'testkey', 'troopTrackPartnerKey': 'howdy'};
        mockFs(mockFsConfig);

        app.start();

        mockFs.restore();

        expect(passedPort).to.equal(668);
        expect(passedPartnerToken).to.equal('howdy');

        done();
    });

});
