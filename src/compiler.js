var when = require('when');

var Compiler = {};

Compiler.compile = function (opts) {
  var self = this;
  opts = opts || {};

  var taskName = opts.task || self.config.defaultTask;
  var stream = self.start(taskName);

  return when.promise(function (resolve, reject) {
    stream.on('error', reject);
    stream.on('end', resolve);
  });
};

module.exports = Compiler;

