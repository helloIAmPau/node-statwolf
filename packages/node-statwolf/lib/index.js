/**
 * Index module
 * The entry-point for node-statwolf package
 *
 * @module index
 * @exports Statwolf
 **/
var util = require('util');
var EventEmitter = require('events');
var StatwolfService = require('./services/statwolf');
var CodeConverter = require('statwolf-codeconverter');
var babel = require('statwolf-babel-preset');
var fs = require('fs');

/**
 * The Statwolf class implements the entry-point to the Statwolf services in node.
 *
 * @extends EventEmitter
 * @constructor
 *
 * @fires pushDone event, emitted when the push operation is completed;
 * @fires commandEvaluated event, emitted on the result of a Statwolf command;
 * @fires logEnabled, logDisabled and logChunkReceived events, emitted to notify a client about the log status.
 **/
var Statwolf = module.exports = function() {
  EventEmitter.call(this);

  var self = this;

  this._statwolfService = new StatwolfService();

  this._statwolfService.on('loadDone', function(data, error) {
    self.emit('pushDone', data, error);
  });
  this._statwolfService.on('deleteDone', function(data, error) {
    self.emit('deleteDone', data, error);
  });
  // ...do the same to check the execution of a command.
  this._statwolfService.on('runRemoteCommandDone', function(data, error, id) {
    self.emit('commandEvaluated', data, error);

    if (id) {
      self.emit('commandEvaluated::' + id, data, error);
    }
  });
};
util.inherits(Statwolf, EventEmitter);

/**
 * _validateOptions validates a general options object. Test here the common options only.
 *
 * @private
 *
 * @param {Object} options is the options object to validate.
 **/
var _validateOptions = function(options) {

  // the host URL should be a valid http/https address
  var result = options.host.match(/https?:\/\/(\w+\.?)+/);
  if (!result) throw new Error('Invalid host provided. The format should be: http[s]://remote.host.com');

};

/**
 * runCommand proxies the runRemoteCommand command to the StatwolfService component.
 *
 * @param {Object} options is the options object for the command.
 * @param {String} options.host is the host of the remote Statwolf environment (it should be a valide http/https url).
 * @param {Number} options.port is the port of the remote Statwolf environment.
 * @param {String} options.userid is the username of the user running the command.
 * @param {String} options.token is the password of the user.
 * @param {String} options.command an ES6 javascript script to run on the remote environment.
 **/
Statwolf.prototype.runCommand = function(options) {
  _validateOptions(options);

  var httpConfig = {
    url: options.host,
    port: options.port
  };
  var content = {
    Command: 'InvokeConsole',
    Data: JSON.stringify({
      user: options.userid,
      key: options.token,
      command: babel(options.command)
    })
  };
  return this._statwolfService.runRemoteCommand(httpConfig, content);
};

/**
 * runTests executes a set of spec files on the remote Statwolf environment.
 * It levereges on the runRemoteCommand function and returns a report as result.
 *
 * @fires testsExecuted when all tests are executed.
 *
 * @param {Object} options is the input for the function.
 * @param {String} options.host is the host of the remote Statwolf environment (it should be a valide http/https url).
 * @param {Number} options.port is the port of the remote Statwolf environment.
 * @param {String} options.userid is the username of the user running the command.
 * @param {String} options.token is the password of the user.
 * @param {String | String[]} options.testFiles is an array of spec files.
 **/
Statwolf.prototype.runTests = function(options) {
  _validateOptions(options);
  if (!Array.isArray(options.testFiles)) options.testFiles = [options.testFiles];

  var httpConfig = {
    url: options.host,
    port: options.port
  };

  var self = this;

  // the result object indexed by file path.
  var results = {};

  options.testFiles.forEach(function(testFile) {
    var content = {
      Command: 'InvokeConsole',
      Data: JSON.stringify({
        user: options.userid,
        command: babel(fs.readFileSync(testFile, 'utf8')),
        key: options.token
      })
    };

    // here each test file is executed on the remote environment as a common Statwolf command.
    var id = self._statwolfService.runRemoteCommand(httpConfig, content);
    // each command fires a new commandEvaluated event.
    self.once('commandEvaluated::' + id, function(data, error) {
      if (error) throw new Error(error.message);
      results[testFile] = data.logs.map(function(item) {
        return item.msg;
      }).join('\n');

      if (Object.keys(results).length === options.testFiles.length) {
        // at the end the testsExecuted event is fired with the result object as argument.
        self.emit('testsExecuted', Object.keys(results).map(function(key) {
          return results[key];
        }).join('\n'));
      }
    });
  });
};

/**
 * push creates a valid Statwolf changeset bundle and proxies the loadBundle command to the StatwolfService component.
 *
 * @param {Object} options is the options object for the command.
 * @param {String} options.host is the host of the remote Statwolf environment (it should be a valide http/https url).
 * @param {Number} options.port is the port of the remote Statwolf environment.
 * @param {String} options.userid is the username of the user running the command.
 * @param {String} options.token is the password of the user.
 * @param {String} [options.basedir = ./] is the basedir of your Statwolf repository.
 * @param {String[]} options.changes is the list of the files to include in the bundle.
 * @param {String[]} options.deleted is the list of the files to remove from the Statwolf changeset.
 **/
Statwolf.prototype.push = function(options) {
  try {
    _validateOptions(options);

    var bundle = CodeConverter.compress({
      dir: options.basedir ? options.basedir + '/' : './',
      changeset: options.changes,
      deletedset: options.deleted,
    });

    this._statwolfService.loadBundle({
      url: options.host,
      port: options.port,
      user: options.userid,
      key: options.token
    }, {
      Command: 'Publish',
      Data: JSON.stringify({
        user: options.userid,
        key: options.token,
        delete_all: options.delete_all,
        changes: bundle.Items.map(function(item) {
          return {
            path: [item.Workspace, item.Name].join('.'),
            type: item.ComponentType,
            delete: item.delete,
            data: item.Serialized
          };
        })
      })
    });
  } catch(e) {
    this.emit('pushDone', null, e);
  }

};
