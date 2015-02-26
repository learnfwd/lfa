var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Watcher(lfa) {
  this.lfa = lfa;
}

util.inherits(Watcher, EventEmitter);

Watcher.prototype.start = function start() {
  var self = this;

  //TODO: start()
  setTimeout(function () {
    self.emit('stopped');
  }, 5000);
};

Watcher.prototype.stop = function stop() {
  //TODO: stop()
};

module.exports = {
  watch: function () {
    return new Watcher(this);
  }
};
