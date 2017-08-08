var chai = require('chai');
var should = chai.should();

var sm = require('sandboxed-module');

var HTTPMockFactory = require('statwolf-mocks').http;
var EventsMock = require('statwolf-mocks').events;
var NetMockFactory = require('statwolf-mocks').net;

describe('The statwolf service', function() {
  var uut;
  var http;
  var https;
  var request;
  var response;
  var net;

  var credentials;

  var commandRequest = {
    url: 'http://my url',
    port: 1337,
    key: 'my key',
    command: 'gimme that'
  };

  var emptyData = {
    logs: [],
    result: [ null ]
  };

  var bundle = [];

  beforeEach(function(done) {
    http = HTTPMockFactory();
    https = HTTPMockFactory();
    request = HTTPMockFactory.request();
    response = HTTPMockFactory.response();
    net = NetMockFactory();

    credentials = {
      url: 'http://the url',
      port: 9999,
      userid: 'the id',
      publishKey: 'the token'
    };

    var uutModule = sm.require('../../lib/services/statwolf', {
      requires: {
        http: http,
        https: https,
        events: EventsMock,
        net: net
      }
    });
    uut = new uutModule();
    done();
  });

  it('should be child of event emitter', function(done) {
    (uut instanceof EventsMock).should.be.equal(true);
    done();
  });

  it('should support https', function(done) {
    credentials.url = 'https://fakeaddress';
    https.request = function(opts) {
      opts.protocol.should.be.equal('https:');
      done();

      return request;
    };

    uut.loadBundle(credentials, bundle);
  });

  it('should handle a successfully reply', function(done) {
    response.reply = JSON.stringify({ Success: true, Data: { TestFile: true } });

    uut.on('loadDone', function(data, error) {
      should.not.exist(error);
      data.TestFile.should.be.equal(true);
      done();
    });

    http.request = function(options, callback) {
      callback(response);

      return request;
    };

    uut.loadBundle(credentials, bundle);
  });

  it('should handle a successful command result', function(done) {
    response.reply = JSON.stringify({ Success: true, Data: {
      logs: [{msg: 'log will be here'}],
      result: 'my awesome result'
    }});

    uut.on('runRemoteCommandDone', function(data, error) {
      should.not.exist(error);
      data.logs[0].msg.should.be.equal('log will be here');
      data.result.should.be.equal('my awesome result');
      done();
    });

    http.request = function(options, callback) {
      callback(response);
      return request;
    };

    uut.runRemoteCommand(commandRequest, null);
  });

  it('should handle an exception reply', function(done) {
    response.reply = JSON.stringify({ Success: false, Data: { Message: true } });

    uut.on('loadDone', function(data, error) {
      error.message.should.be.equal(true);
      should.not.exist(data);
      done();
    });

    http.request = function(options, callback) {
      callback(response);

      return request;
    };

    uut.loadBundle(credentials, bundle);
  });

  it('should handle an exception object when present in the reply', function(done) {
    response.reply = JSON.stringify({Success: true, Data: {
      logs: [],
      Exceptions: [{myField: 'test field'}]
    }});

    uut.on('runRemoteCommandDone', function(data, error) {
      error.myField.should.be.equal('test field');
      should.exist(data);
      done();
    });

    http.request = function(options, callback) {
      callback(response);
      return request;
    };

    uut.runRemoteCommand(commandRequest, null);

  });

  it('should handle an error reply', function(done) {
    response.reply = JSON.stringify({ Success: true, Data: false });

    uut.on('loadDone', function(data, error) {
      error.message.should.be.equal('Invalid request. Check your configurations!');
      should.not.exist(data);
      done();
    });

    http.request = function(options, callback) {
      callback(response);

      return request;
    };

    uut.loadBundle(credentials, bundle);
  });

  it('should handle an error reply when request is bad', function(done) {
    response.reply = JSON.stringify({ Success: false, Data: { Message: 'cacca' }});

    uut.on('runRemoteCommandDone', function(data, error) {
      error.message.should.be.equal('cacca');
      should.not.exist(data);
      done();
    });

    http.request = function(options, callback) {
      callback(response);
      return request;
    };

    uut.runRemoteCommand(commandRequest, null);

  });

  it('should load a bundle on the remote statwolf server', function(done) {
    request.write = function(data) {
      data.should.be.equal(JSON.stringify(bundle));
    };

    request.end = done;

    http.request = function(options, callback) {
      options.hostname.should.be.equal('the url');
      options.port.should.be.equal(9999);
      options.path.should.be.equal('/v1/engine/publish');
      options.method.should.be.equal('POST');
      options.protocol.should.be.equal('http:');

      return request;
    };

    uut.loadBundle(credentials, bundle);
  });

  it('should properly decorate a request for running a remote console', function(done) {
    request.write = function(data) {
      data.should.be.equal(JSON.stringify(emptyData));
    };

    request.end = done;

    http.request = function(options, callback) {
      options.hostname.should.be.equal('my url');
      options.port.should.be.equal(1337);
      options.path.should.be.equal('/api/Custom/DashboardToolbox');
      options.method.should.be.equal('POST');
      options.protocol.should.be.equal('http:');

      return request;
    };

    uut.runRemoteCommand(commandRequest, emptyData);

  });

  it('should connect itsef to the logger', function(done) {
    var client = net.connect();
    net.connect = function(opts, callback) {
      opts.port.should.be.equal('the port');
      opts.address.should.be.equal('the address');
      callback();
      return client;
    };

    uut.on('logClientConnected', function() {
      done();
    });

    uut.enableLog({ port: 'the port', address: 'the address' });
  });

  it('should emit an event on new data', function(done) {
    var client = net.connect();
    uut.on('logData', function(data) {
      data.should.be.equal('test data');
      done();
    });

    uut.enableLog({ port: 'the port', address: 'the address' });
    client.c.data(new Buffer('test data'));
  });

  it('should close the connection to the log server on close', function(done) {
    var client = net.connect();
    client.removeAllListeners = function(e) {};
    client.end = function() {
      done();
    };

    uut.enableLog({ port: 'the port', address: 'the address' });
    uut.disableLog();
  });

  it('should remove all listener on disableLog', function(done) {
    uut.on('logClientDisconnected', function() {
      done();
    });

    var client = net.connect();
    client.end = function() {};
    client.removeAllListeners = function(e) {
      e.should.be.equal('data');
    };

    uut.enableLog();
    uut.disableLog();
  });

  it('should return an id on command', function(done) {
    uut.runRemoteCommand(commandRequest, null).should.be.a('string');
    done();
  });


});
