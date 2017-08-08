var _request;
var _response;

module.exports = function() {
  _request = {};

  _request.on = function(evt, callback) {
  };

  _request.write = function(data) {
  };

  _request.end = function() {
  };

  _response = {};

  _response.statusCode = 200;
  _response.reply = '';
  _response.dataClb = undefined;

  _response.on = function(evt, callback) {
    if(evt === 'data') {
      this.dataClb = callback;
      callback(this.reply.substring(0, 5));
    }

    if(evt === 'end') {
      this.dataClb(this.reply.substring(5, 1000));
      callback();
    }
  };

  var HTTP = {};

  HTTP.request = function(options, callback) {
    return _request;
  };

  return HTTP;
};

module.exports.request = function() {
  return _request;
};

module.exports.response = function() {
  return _response;
};
