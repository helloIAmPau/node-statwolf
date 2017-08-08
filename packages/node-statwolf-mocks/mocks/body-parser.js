module.exports = function() {
  var module = {};

  var jsonParser = {};
  module.json = function() {
    return jsonParser;
  };

  return module;
};
