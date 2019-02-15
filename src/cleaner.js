var fs = require('fs-extra');

var Cleaner = {};

Cleaner.cleanProject = function (config) {
  var LFA = this;

  var prom;
  if (typeof(config) !== 'object' ||
      typeof(config.releaseBuildPath) !== 'string' ||
      typeof(config.debugBuildPath) !== 'string'
  ) {
    prom = LFA.loadPaths(config).then(function (r) {
      config = r;
    });
  } else {
    prom = Promise.resolve();
  }

  return prom.then(function () {
    return Promise.all([
      fs.remove(config.debugBuildPath),
      fs.remove(config.releaseBuildPath),
      fs.remove(config.tmpPath),
    ]);
  });
};

module.exports = Cleaner;

