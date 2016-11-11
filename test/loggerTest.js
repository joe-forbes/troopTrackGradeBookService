/* loggerTest.js
 * 
 * Test logger functions.
 */
require("should");

var logger = require('../logger');
var tmp = require("tmp");
var fs = require("fs");
var stdout = require("test-console").stdout;
var stderr = require("test-console").stderr;
var stddebug = require("test-console").stddebug;

var defaultConsoleConfig = {targetType: "console"};
var defaultFileConfig = {targetType: "file"};
var warningFileConfig = {
    targetType : "file",
    targetConfig : {
      level : 'warn',
      filename : "foo",
      handleExceptions : true,
      json : true,
      maxsize : 5242880, // 5MB
      maxFiles : 5,
      colorize : false
    }};

describe(
    "Logger.stream.write tests",
    function (){
      afterEach(function() {
        logger.removeTarget("console");
      });
      
      it(
          "should write info to log wihen log.stream.write is called",
          function () {
            logger.addTarget(defaultConsoleConfig);
            var messageTypes = [ "info" ];
            var messagesSought = [];
            var inspect = stdout.inspect();

            for (messageTypeIndex in messageTypes) {
              var messageType = messageTypes[messageTypeIndex];
              var message = "xyzzy-" + messageType + "-" + new Date();
              logger.stream.write(message);
              messagesSought.push(messageType + ": " + message + "\n");
            }
            inspect.restore();

            var messagesActual = inspect.output;

            // strip out color codes
            for (var i = 0; i < messagesActual.length; i++) {
              messagesActual[i] = messagesActual[i]
                  .replace(/\u001b\[.*?m/g, '');
            }
            messagesActual.should.eql(messagesSought);            
          });
    });
      
describe(
    "Console logging tests",
    function() {

      afterEach(function() {
        logger.removeTarget("console");
      });

      it(
          "should log debug, info, errors, and warnings to console if default console config is used",
          function() {
            logger.addTarget(defaultConsoleConfig);
            var messageTypes = [ "warn", "info", "error", "debug" ];
            var messagesSought = [];
            var inspect = stdout.inspect();
            var inspectErr = stderr.inspect();

            for (messageTypeIndex in messageTypes) {
              var messageType = messageTypes[messageTypeIndex];
              var message = "xyzzy-" + messageType + "-" + new Date();
              logger[messageType](message);
              messagesSought.push(messageType + ": " + message + "\n");
            }
            inspect.restore();
            inspectErr.restore();

            var messagesActual = inspect.output.concat(inspectErr.output);

            // strip out color codes
            for (var i = 0; i < messagesActual.length; i++) {
              messagesActual[i] = messagesActual[i]
                  .replace(/\u001b\[.*?m/g, '');
            }
            messagesActual.should.eql(messagesSought);
          });

              it(
              "should work to call addTargets instead of addTarget",
              function() {
                logger.addTargets(defaultConsoleConfig);
                var messageTypes = [ "warn", "info", "error", "debug" ];
                var messagesSought = [];
                var inspect = stdout.inspect();
                var inspectErr = stderr.inspect();

                for (messageTypeIndex in messageTypes) {
                  var messageType = messageTypes[messageTypeIndex];
                  var message = "xyzzy-" + messageType + "-" + new Date();
                  logger[messageType](message);
                  messagesSought.push(messageType + ": " + message + "\n");
                }
                inspect.restore();
                inspectErr.restore();

                var messagesActual = inspect.output.concat(inspectErr.output);

                // strip out color codes
                for (var i = 0; i < messagesActual.length; i++) {
                  messagesActual[i] = messagesActual[i]
                      .replace(/\u001b\[.*?m/g, '');
                }
                messagesActual.should.eql(messagesSought);
              });

    });

describe(
    "Logger exception tests",
    function() {

      it(
          "should throw an exception if an attempt is made to add a target with an invalid targetType",
          function() {
            (function(){
              logger.addTarget({targetType: "database"})
              }).should.throw("Invalid targetType \"database\"");
          });

      it(
          "should throw an exception if an attempt is made to remove a target with an invalid targetType",
          function() {
            (function(){
              logger.removeTarget("database")
              }).should.throw("Invalid targetSpec \"database\"");
          });
    });

describe(
    "File logging tests",
    function() {

      afterEach(function() {
        logger.removeTarget("file");
      });

      it(
          "should log info, errors, and warnings to app.log if logger.addFile is called with no options",
          function(done) {
            logger.addTarget(defaultFileConfig);
            var infoMessage = "xyzzyInfo" + new Date();
            var errorMessage = "xyzzyError" + new Date();
            var warnMessage = "xyzzyWarn" + new Date();
            var debugMessage = "xyzzyDebug" + new Date();
            logger.info(infoMessage);
            logger.error(errorMessage);
            logger.warn(warnMessage);
            logger.debug(debugMessage);
            function readLogFile() {
              var logFileContents = fs.readFileSync("./app.log", {
                encoding : "utf8"
              });
              logFileContents.indexOf(infoMessage).should.not.equal(-1);
              logFileContents.indexOf(errorMessage).should.not.equal(-1);
              logFileContents.indexOf(warnMessage).should.not.equal(-1);
              logFileContents.indexOf(debugMessage).should.equal(-1);
              done();
            }
            ;
            setTimeout(readLogFile, 10);
          });

      it(
          "should log info, errors, and warnings to app.log if logger.addTarget is called with no arguments",
          function(done) {
            logger.addTarget();
            var infoMessage = "xyzzyInfo" + new Date();
            var errorMessage = "xyzzyError" + new Date();
            var warnMessage = "xyzzyWarn" + new Date();
            var debugMessage = "xyzzyDebug" + new Date();
            logger.info(infoMessage);
            logger.error(errorMessage);
            logger.warn(warnMessage);
            logger.debug(debugMessage);
            function readLogFile() {
              var logFileContents = fs.readFileSync("./app.log", {
                encoding : "utf8"
              });
              logFileContents.indexOf(infoMessage).should.not.equal(-1);
              logFileContents.indexOf(errorMessage).should.not.equal(-1);
              logFileContents.indexOf(warnMessage).should.not.equal(-1);
              logFileContents.indexOf(debugMessage).should.equal(-1);
              done();
            }
            ;
            setTimeout(readLogFile, 10);
          });

      it(
          "should log errors and warnings to specified file if logger.addFile is called with file specified and level = \"warn\"",
          function(done) {
            tmp.file(function _tempFileCreated(err, path, fd) {
              if (err)
                throw err;
              var fileConfig = JSON.parse(JSON.stringify(warningFileConfig));
              fileConfig.targetConfig.filename = path;
              logger.addTarget(fileConfig);
              var infoMessage = "xyzzyInfo" + new Date();
              var errorMessage = "xyzzyError" + new Date();
              var warnMessage = "xyzzyWarn" + new Date();
              var debugMessage = "xyzzyDebug" + new Date();
              logger.info(infoMessage);
              logger.error(errorMessage);
              logger.warn(warnMessage);
              logger.debug(debugMessage);
              function readLogFile() {
                var logFileContents = fs.readFileSync(path, {
                  encoding : "utf8"
                });
                logFileContents.indexOf(infoMessage).should.equal(-1);
                logFileContents.indexOf(errorMessage).should.not.equal(-1);
                logFileContents.indexOf(warnMessage).should.not.equal(-1);
                logFileContents.indexOf(debugMessage).should.equal(-1);
                done();
              }
              ;
              setTimeout(readLogFile, 10);
            });
          });
    });

describe("addMultipleTargets tests",
    function() {
      afterEach(function() {
        logger.removeTarget("file");
        logger.removeTarget("console");
      });
      
      it("should properly load multiple targets",
          function(done) {
        tmp.file(function _tempFileCreated(err, path, fd) {
          if (err)
            throw err;
          var fileConfig = JSON.parse(JSON.stringify(warningFileConfig));
          fileConfig.targetConfig.filename = path;
          logger.addTargets([fileConfig, defaultConsoleConfig]);
          var messageTypes = [ "warn", "info", "error", "debug" ];
          var messagesSought = [];
          var inspect = stdout.inspect();
          var inspectErr = stderr.inspect();

          for (messageTypeIndex in messageTypes) {
            var messageType = messageTypes[messageTypeIndex];
            var message = "xyzzy-" + messageType + "-" + new Date();
            logger[messageType](message);
            messagesSought.push(messageType + ": " + message + "\n");
          }
          inspect.restore();
          inspectErr.restore();

          var messagesActual = inspect.output.concat(inspectErr.output);

          // strip out color codes
          for (var i = 0; i < messagesActual.length; i++) {
            messagesActual[i] = messagesActual[i]
                .replace(/\u001b\[.*?m/g, '');
          }
          messagesActual.should.eql(messagesSought);

          function readLogFile() {
            var logFileContents = fs.readFileSync(path, {
              encoding : "utf8"
            });
            logFileContents.indexOf("xyzzy-info").should.equal(-1);
            logFileContents.indexOf("xyzzy-error").should.not.equal(-1);
            logFileContents.indexOf("xyzzy-warn").should.not.equal(-1);
            logFileContents.indexOf("xyzzy-debug").should.equal(-1);
            done();
          }
          ;
          setTimeout(readLogFile, 10);
        });
      });
  });
