/**
 * Statwolf module
 * A javascript client for Statwolf services
 *
 * @module statwolf
 * @exports Statwolf
 **/
var zlib = require('zlib');
var util = require('util');
var EventEmitter = require('events');
var net = require('net');

/**
 * The Statwolf class implements a client for the Statwolf remote API.
 *
 * @extends EventEmitter
 * @constructor
 **/
var Statwolf = module.exports = function() {
  EventEmitter.call(this);
  this.logClient = null;
};
util.inherits(Statwolf, EventEmitter);

/**
 * doHttpRequest performs an HTTP request to an HTTP endpoint and parses the JSON response.
 * 
 * @private
 *
 * @param {Object} requestConfig contains the HTTP configurations for the current request.
 * @param {String} requestConfig.url is the endpoint HTTP URL.
 * @param {Number} requestConfig.port is the endpoint port.
 * @param {String} requestConfig.path is the path the remote service.
 * @param {String} requestConfig.method is the HTTP method for the request.
 * @param {Object) body is the JSON object to send as content of the request.
 * @param {Function} callback is the callback called once that the request is over.
 **/
var _doRequest = function(requestConfig, body, callback) {

  var responseCallback = function(response) {
    var message = '';

    response.on('data', function(chunk) {
      message += chunk;
    });

    response.on('end', function() {
      message = JSON.parse(message);
      var error;
      if(message.Success === false) {
        error = { message: message.Data.Message };
        message = undefined;
      }
      // the callback gets as argument the response message if the error object is null.
      callback(message, error);
    });
  };

  if(requestConfig.zipBody) {
    body = body.toString('base64');
  }
  var url = requestConfig.url.split('//');

  var http = require(url[0].slice(0, -1));

  request = http.request({
    protocol: url[0],
    hostname: url[1],
    port: requestConfig.port,
    path: requestConfig.path,
    method: requestConfig.method,
    headers: {
      'Content-Type': 'application/json',
      'statwolf-encoding': requestConfig.zipBody ? 'gzip' : 'plain',
      'Content-Length': Buffer.byteLength(body)
    }
  }, responseCallback);

  request.on('error', function(error) {
    console.log(error);
    callback(null, error);
  });

  request.write(body);
  request.end();
};

var doHttpRequest = function(requestConfig, body, callback) {
  if(!requestConfig.zipBody) {
    return _doRequest(requestConfig, JSON.stringify(body), callback);
  }

  zlib.gzip(JSON.stringify(body), function(e, zippedBody) {
    _doRequest(requestConfig, zippedBody, callback);
  });
};

/**
 * runRemoteCommand send an HTTP request to the Statwolf endpoint.
 *
 * @param {Object} httpConfig contains the infos of the remote endpoint.
 * @param {String} httpConfig.url is the endpoint HTTP URL.
 * @param {Number} httpConfig.port is the endpoint port.
 * @param {Object} requestData is the Statwolf payload for the current request.
 * @param {String} requestData.Command is the command the user wants to execute.
 * @param {String} requestData.Data is the stringified version of the command argument object.
 **/
Statwolf.prototype.runRemoteCommand = function(httpConfig, requestData) {
  var self = this;
  var commandId = Math.random().toString(26).substring(3, 7);

  var responseCallback = function(response, error) {
    var data;

    if(!error && response.Data.Exceptions) error = response.Data.Exceptions[0];

    data = response ? {
      logs: response.Data.logs,
      result: response.Data.result
    } : null;
    self.emit('runRemoteCommandDone', data, error, commandId);
  };

  httpConfig.path = '/api/Custom/DashboardToolbox';
  httpConfig.method = 'POST';

  doHttpRequest(httpConfig, requestData, responseCallback);

  return commandId;
};

/**
 * loadBundle sends a valid Statwolf changeset bundle to the Statwolf endpoint.
 *
 * @param {Object} httpConfig is an object containing the endpoint http informations.
 * @param {String} httpConfig.url is the endpoint HTTP URL.
 * @param {Number} httpConfig.port is the endpoint port.
 * @param {Object} bundle is the Statwolf changeset bundle.
 * @param {String} bundle.user is the username of the current user.
 * @param {String} bundle.key is the password of the current user.
 * @param {Boolean} bundle.delete_all is a flag that enables the changeset cleanup.
 * @param {Object[]} bundle.changes is the array of elements to push/delete to/from the changeset.
 * @param {String} bundle.changes[].path is the path of the current item.
 * @param {String} bundle.changes[].type is the type of the Statwolf component.
 * @param {Boolean} bundle.changes[].delete if true, Statwolf deletes the current component.
 * @param {String} bundle.changes[].data is the body of the Statwolf component.
 **/
Statwolf.prototype.loadBundle = function(httpConfig, bundle) {
  var self = this;

  var responseCallback = function(message, error) {
    var data;

    if(!error && message.Data === false)
      error = { message: 'Invalid request. Check your configurations!' };

    data = error ? undefined : message.Data;
    self.emit('loadDone', data, error);
  };

  httpConfig.path = '/api/Custom/DashboardToolbox';
  httpConfig.method = 'POST';

  //httpConfig.zipBody = true;

  doHttpRequest(httpConfig, bundle, responseCallback);
};
