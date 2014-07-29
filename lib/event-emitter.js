var EventEmitter = require('events').EventEmitter;
var when = require('when');
var _ = require('underscore');

EventEmitter.prototype.emitPromised = function(evt) {
  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);
  return when.all(_.map(self.listeners(evt), function(listener) {
    return listener.apply(self, args);
  }));
};

module.exports = EventEmitter;
