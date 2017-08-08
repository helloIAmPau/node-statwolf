var EventEmitter = require('./events');
var util = require('util');

module.exports = function() {
  var RealServicePrototype = function() {
    EventEmitter.call(this);
  };
  util.inherits(RealServicePrototype, EventEmitter);

  RealServicePrototype.prototype.loadBundle = function() {
  };

  RealServicePrototype.prototype.runRemoteCommand = function() {
    return 'the id';
  };

  var realService = new RealServicePrototype();

  var Statwolf = function() {};

  var setter = function(currentKey) {
    Statwolf.prototype[currentKey] = function() {
      return realService[currentKey].apply(realService, arguments);
    };
  };
  for(var key in realService) {
    setter(key);
  }

  Statwolf.getRealService = function() {
    return realService;
  };

  return Statwolf;
};
