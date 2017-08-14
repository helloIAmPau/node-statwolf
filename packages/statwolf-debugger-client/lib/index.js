const WebSocket = require('ws');
const EventEmitter = require('events');

module.exports = function(addr) {
  const proxy = new EventEmitter();

  const client = new WebSocket(addr);

  const _send = function(msg) {
    client.send(JSON.stringify({ type: msg.type, body: JSON.stringify(msg.body) }));
  };

  client.on('open', function() {
    _send({ type: 'join', body: { room: 'debug' } });
  });

  client.on('message', function(msg = '{}') {
    msg = JSON.parse(msg);
    msg.body = JSON.parse(msg.body);

    if(msg.type === 'debug:list') {
      proxy.emit('list', msg.body);

      return;
    }

    proxy.emit(msg.type, msg.body);
  });

  proxy.dbgr = function(id) {
    const dbgr = {};

    dbgr.evaluate = function(code, scope) {
      _send({ type: 'debug:command', body: { code, scope, debugger: id, command: 'eval' } });
    };

    return dbgr;
  };

  return proxy;
};
