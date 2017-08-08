module.exports = function() {
  var module = {};
  
  module.cpus = function() {
    return ['cpu0', 'cpu1', 'cpu2'];
  };

  return module;
};
