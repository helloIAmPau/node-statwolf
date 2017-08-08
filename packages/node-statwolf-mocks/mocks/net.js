module.exports = function() {
  var client = {
    c: {},

    on: function(key, f) {
      this.c[key] = f;

      return this;
    }
  };

  var net = {};

  net.connect = function(opts, callback) {
    if(callback) callback();
    return client;
  };

  return net;
};
