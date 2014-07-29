var Stream = require('stream');

Stream.prototype.pipeErr = function(dest, opt) { 
  var fw = dest.emit.bind(dest, 'error');
  this.on('error', fw);
  var self = this;
  dest.on('unpipe', function (src) { 
    if (src === self) {
      self.removeListener('error', fw);
    }
  });
  return this.pipe(dest, opt);
};

module.exports = Stream;
