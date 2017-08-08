var events = module.exports = function() {
  this.events = {};
};

events.prototype.on = function(evt, callback) {
  this.events[evt] = callback;
};


events.prototype.once = function(evt, callback) {
  var self = this;
  this.on(evt, function() {
    delete this.events[evt];
    callback.apply(self, arguments);
  });
};

events.prototype.emit = function(evt) {
  if(!this.events[evt]) return;

  this.events[evt].apply(this, Array.prototype.slice.call(arguments, 1))
};
