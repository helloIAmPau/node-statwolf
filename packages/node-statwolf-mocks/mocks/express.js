module.exports = function() {
  var _app = {
    getclb: {},
    postclb: {},
    putclb: {},
    deleteclb: {},
    middleware: {},
    uses: [],

    port: undefined,
    address: undefined
  };

  var _registerCallback = function(method, url, callback) {
    if(arguments.length === 3)
      return this[method + 'clb'][url] = callback;

    for(var index=2; index < arguments.length - 1; index++)
      this.middleware[index] = arguments[index];

    this[method + 'clb'][url] = arguments[arguments.length - 1];
  };

  _app.listen = function() {
    this.port = arguments[0];

    var index = 1;
    if(arguments.length > 2) {
      index = 2;
      this.address = arguments[1];
    }

    arguments[index]();
  };

  _app.get = function() {
    _registerCallback.apply(this, ['get'].concat(Array.prototype.slice.call(arguments)));
  };

  _app.post = function() {
    _registerCallback.apply(this, ['post'].concat(Array.prototype.slice.call(arguments)));
  };

  _app.put = function() {
    _registerCallback.apply(this, ['put'].concat(Array.prototype.slice.call(arguments)));
  };

  _app.delete = function() {
    _registerCallback.apply(this, ['delete'].concat(Array.prototype.slice.call(arguments)));
  };

  _app.use = function(item) {
    this.uses.push(item);
  };

  var module = function() {
    return _app;
  };

  return module;
};

module.exports.request = function() {
  var request = {};

  request.body = {};

  return request;
};

module.exports.response = function() {
  var response = {
    statusCode: 200
  };

  response.status = function(status) {
    this.statusCode = status;

    return response;
  };

  response.send = function() {
  };

  return response;
};
