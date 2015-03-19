var when = require('when');

var Compiler = {};

Compiler.compile = function (opts) {
  var self = this;

  return when.try(function () {
    opts = opts || {};
    opts.debug = opts.debug || false;
    opts.warningsAsErrors = opts.warningsAsErrors || false;

    self.currentCompile = {
      debug: opts.debug,
      watcher: opts.watcher,
      serve: opts.serve,
      fileOperations: opts.fileOperations,
      warningsAsErrors: opts.warningsAsErrors,
      saveForIncremental: !!opts.saveCurrentCompile,
      buildPath: opts.debug ? self.config.debugBuildPath : self.config.releaseBuildPath,
    };
    self.previousCompile = opts.previousCompile;

    var taskName = opts.task || self.config.defaultTask;
    var r = self.startIncremental(taskName, {
      saveCache: self.currentCompile.saveForIncremental,
      cache: self.previousCompile ? self.previousCompile.taskCache : null,
      fileOps: self.currentCompile.fileOperations,
    });

    var stream = r.stream;
    self.currentCompile.taskCache = r.cache;

    return when.promise(function (resolve, reject) {
      stream.on('error', reject);
      stream.on('end', resolve);
    }).then(function () {
      return self.currentCompile;
    });
  });
};

module.exports = Compiler;

