var chai = require('chai');
var should = chai.should();
var sm = require('sandboxed-module');

var EventsMock = require('statwolf-mocks').events;
var CCMock = require('statwolf-mocks').codeconverter;
var SSMock = require('statwolf-mocks').statwolfservice;

describe('The index module', function() {

  var uut;
  var events;
  var codeconverter;
  var statwolfService;
  var babel;
  var fs;

  var options = {
    userid: 'user',
    token: 'lgjhlshflsdklsdf',
    host: 'http://0.0.0.0',
    port: 9999,
    basedir:'/test/path',
    deleted: [
      'file2.js'
    ],
    changes: [
      'file1.js'
    ],
    delete_all: 'the delete_all flag'
  };

  var loadModule = function() {
    var uutModule = sm.require('../lib/index', {
      requires: {
        events: EventsMock,
        './services/statwolf': statwolfService,
        codeconverter: codeconverter,
        "statwolf-babel-preset": babel,
        fs: fs
      }
    });
    uut = new uutModule();
  };

  var commandRequestConfig = {
    host: 'http://0.0.0.0',
    port: 1337,
    userid: 'pippolone',
    token: 'myGreatKey',
    command: 'do something'
  };

  var runTestsPayload = {
    host: 'http://the host',
    port: 'the port',
    userid: 'the user',
    token: 'the token',
    testFiles: [
      'the file'
    ]
  };

  beforeEach(function(done) {
    codeconverter = CCMock();
    statwolfService = SSMock();
    fs = {
      readFileSync: function(path) {
        return '';
      }
    };
    babel = function(code) {
      return code;
    };

    loadModule();
    done();
  });

  it('should emit the command event by using the id', function(done) {
    var theData = {};
    var theError = {};

    uut.on('commandEvaluated::the id', function(data, error) {
      data.should.be.equal(theData);
      error.should.be.equal(theError);
      done();
    });

    uut._statwolfService.emit('runRemoteCommandDone', theData, theError, 'the id');
  });

  it('should run tests', function(done) {
    var text = '';
    fs.readFileSync = function(path) {
      path.should.be.equal(runTestsPayload.testFiles[0]);
      return text;
    };

    statwolfService.prototype.runRemoteCommand = function(httpConfig, content) {
      httpConfig.url.should.be.equal(runTestsPayload.host);
      httpConfig.port.should.be.equal(runTestsPayload.port);

      content.Command.should.be.equal('InvokeConsole');
      var data = JSON.parse(content.Data);
      data.user.should.be.equal(runTestsPayload.userid);
      data.key.should.be.equal(runTestsPayload.token);
      data.command.should.be.equal(text);

      done();
    };

    uut.runTests(runTestsPayload);
  });

  it('should be child of event emitter', function(done) {
    (uut instanceof EventsMock).should.be.equal(true);
    done();
  });

  it('should send the file bundle on push', function(done) {
    var storedBundle = codeconverter.compress();
    codeconverter.compress = function(compressOptions) {
      compressOptions.dir.should.be.equal(options.basedir + '/');
      compressOptions.changeset.should.be.equal(options.changes);
      compressOptions.deletedset.should.be.equal(options.deleted);

      return storedBundle;
    };

    var changes = storedBundle.Items.map(function(item) {
      return {
        path: [item.Workspace, item.Name].join('.'),
        type: item.ComponentType,
        data: item.Serialized,
        delete: item.delete
      };
    });

    statwolfService.getRealService().loadBundle = function(endpoint, bundle) {
      endpoint.url.should.be.equal(options.host);
      endpoint.port.should.be.equal(options.port);

      bundle.user.should.be.equal(options.userid);
      bundle.key.should.be.equal(options.token);
      bundle.delete_all.should.be.equal(options.delete_all);
      bundle.changes[0].data.should.be.equal(changes[0].data);
      bundle.changes[1].delete.should.be.equal(changes[1].delete);
      done();
    };

    uut.push(options);
  });

  it('should call a command remotely', function(done) {
    statwolfService.prototype.runRemoteCommand = function(httpConfig, requestData) {
      httpConfig.url.should.be.equal(commandRequestConfig.host);
      httpConfig.port.should.be.equal(commandRequestConfig.port);

      requestData.Command.should.be.equal('InvokeConsole');
      var o = JSON.parse(requestData.Data);
      o.key.should.be.equal(commandRequestConfig.token);
      o.command.should.be.equal(commandRequestConfig.command);
      o.user.should.be.equal(commandRequestConfig.userid);
      done();
      return 'the id';
    };

    uut.runCommand(commandRequestConfig);
  });

  it('should emit pushDone event on loadDone', function(done) {
    var testData = {};
    var testError = {};

    uut.on('pushDone', function(data, error) {
      data.should.be.equal(testData);
      error.should.be.equal(testError);
      done();
    });

    statwolfService.getRealService().emit('loadDone', testData, testError);
  });

  it('should emit logEnabled on logClientConnected', function(done) {
    uut.on('logEnabled', function() {
      done();
    });

    statwolfService.getRealService().emit('logClientConnected');
  });

  it('should emit logDisabled on logClientDisconnected', function(done) {
    uut.on('logDisabled', function() {
      done();
    });

    statwolfService.getRealService().emit('logClientDisconnected');
  });

  it('should emit logChunkReceived on logiData', function(done) {
    uut.on('logChunkReceived', function(data) {
      data.content.should.be.equal('test');
      done();
    });

    statwolfService.getRealService().emit('logData', 'test');
  });

  it('should enable log', function(done) {
    statwolfService.prototype.enableLog = function(opts) {
      opts.port.should.be.equal('the port');
      opts.host.should.be.equal('http://theaddress');
      done();
    };

    uut.enableLog({ port: 'the port', host: 'http://theaddress' });
  });

  it('should disaable log', function(done) {
    statwolfService.prototype.disableLog = function() {
      done();
    };

    uut.disableLog();
  });

  it('should babelize the input on console command', function(done) {
    statwolfService.prototype.runRemoteCommand = function(httpConfig, requestData) {};

    var testCommand = 'a test command';
    babel = function(command) {
      command.should.be.equal(testCommand);
      done();
      return command;
    };
    loadModule();

    uut.runCommand({
      host: 'http://ciccio',
      command: testCommand
    });

  });

  it('should except if the host is not properly set', function(done) {
    var options = {
      host: 'invalid host'
    };

    (function() {
      uut.runCommand(options);
    }).should.throw('Invalid host provided. The format should be: http[s]://remote.host.com');
    (function() {
      uut.push(options);
    }).should.throw('Invalid host provided. The format should be: http[s]://remote.host.com');
    (function() {
      uut.enableLog(options);
    }).should.throw('Invalid host provided. The format should be: http[s]://remote.host.com');

    done();
  });
});
