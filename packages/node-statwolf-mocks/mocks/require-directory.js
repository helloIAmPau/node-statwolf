module.exports = function() {

  var _path = undefined;
  var _result = {};

  var module = function(m, p) {
    _path = p;

    return _result;
  };

  module.getPath = function() {
    return _path;
  };

  module.setResult = function(result) {
    _result = result;
  };

  return module;
};
