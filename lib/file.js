var when = require('when');
var stream = require('stream');

function File(target) {
  this.target = target;
  this.project = target.project;
  this.task = null;
}

File.prototype.setTask = function(task) {
  this.task = task;
};

File.prototype.readContents = function() {
  var self = this;
  return when.promise(function(resolve, reject) {
    if (self.stream) {
      var out = new stream.Writable();
      var buffers = [];
      out._write = function(chunk, encoding, cb) {
        buffers.push(chunk);
        cb();
      };
      out.on('error', function(err) {
        reject(err);
      });
      out.on('finish', function() {
        self.content = Buffer.concat(buffers).toString('utf8');
        self.stream = null;
        resolve(self.content);
      });

      self.stream.on('error', function (err) {
        reject(err);
      }).pipe(out);
    } else {
      resolve(self.content);
    }
  });
};

module.exports = File;
