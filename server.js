/*
 * server.js - main entry point for the application
 * The sole purpose of server.js is to invoke startup on the app.
 * Server.js and app.js are separate in order to support testing;
 * I don't know how to test a javascript module that starts itself.
 * Some code is invoked the first time a module is 'required' and
 * can't be undone or repeated, as needed to test different scenarios.
 */

var app = require('./app.js');
app.start();
