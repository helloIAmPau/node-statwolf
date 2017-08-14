const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
const sm = require('sandboxed-module');
const EventEmitter = require('events');

describe('The index module', function() {

  let mut;
  let wsMock;
  let wsClient;
  let wsEmitter;

  beforeEach(function(done) {
    wsMock = function wsMock(addr) {
      addr.should.be.equal('the address');

      wsClient = this;
      wsEmitter = new EventEmitter();

      const internalEmit = wsEmitter.emit;
      wsEmitter.emit = function(evt, arg = {}) {
        arg = JSON.stringify({ type: arg.type, body: JSON.stringify(arg.body) });

        internalEmit.call(wsEmitter, evt, arg);
      };

      this.on = function() {
        wsEmitter.on.apply(wsEmitter, arguments);
      };

      this.send = function() {};
    };


    mut = sm.require('../lib/index', {
      requires: {
        ws: wsMock
      }
    });

    done();
  });

  it('should create a client instance', function(done) {
    const client = mut('the address');
    client.should.be.instanceOf(EventEmitter);

    done();
  });

  it('should join the debug room on open', function(done) {
    const client = mut('the address');

    wsClient.send = function(msg) {
      msg = JSON.parse(msg);
      msg.body = JSON.parse(msg.body);

      msg.type.should.be.equal('join');
      msg.body.room.should.be.equal('debug');

      done();
    };

    wsEmitter.emit('open');
  });

  it('should manage protocol requests', function(done) {
    const client = mut('the address');

    const reply = { type: 'dummy command', body: { test: 'pippo' } };

    client.on('dummy command', function(payload) {
      expect(payload).to.be.deep.equal(reply.body);
      done();
    });

    wsEmitter.emit('message', reply);
  });

  it('should evaluate a command in a frame', function(done) {
    const client = mut('the address');
    const code = 'return 1;';
    const scope = 99;
    const dbg = 'the debugger';
    const result = { type: 'eval', body: { result: 'pippo' } };

    wsClient.send = function(msg) {
      msg = JSON.parse(msg);
      msg.body = JSON.parse(msg.body);

      msg.type.should.be.equal('debug:command');
      msg.body.code.should.be.equal(code);
      msg.body.command.should.be.equal('eval');
      msg.body.scope.should.be.equal(scope);
      msg.body.debugger.should.be.equal(dbg);

      wsEmitter.emit('message', result);
    };

    client.on('eval', function(reply) {
      expect(reply).to.be.deep.equal(result.body);
      done();
    });

    client.dbgr(dbg).evaluate(code, scope);
  });

  it('should emit the list event', function(done) {
    const client = mut('the address');
    const result = { type: 'debug:list', body: { test: 'fake' } };

    client.on('list', function(reply) {
      expect(reply).to.be.deep.equal(result.body);
      done();
    });

    wsEmitter.emit('message', result);
  });

});
