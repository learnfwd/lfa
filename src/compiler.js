var when = require('when');

var Compiler = {};

Compiler.compile = function (opts) {
  var self = this;

  return when.try(function () {
    opts = opts || {};
    opts.debug = opts.debug || false;

    self.currentCompile = {
      debug: opts.debug,
      watcher: opts.watcher,
      saveForIncremental: !!opts.saveCurrentCompile,
      buildPath: opts.debug ? self.config.debugBuildPath : self.config.releaseBuildPath,
    };
    self.previousCompile = opts.previousCompile;

    var taskName = opts.task || self.config.defaultTask;
    var stream = self.start(taskName);

    return when.promise(function (resolve, reject) {
      stream.on('error', reject);
      stream.on('end', resolve);
    }).then(function () {
      return self.currentCompile;
    });
  });
};

module.exports = Compiler;

