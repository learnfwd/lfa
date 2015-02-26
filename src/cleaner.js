var when = require('when');
var nodefn = require('when/node');
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
    prom = when();
  }

  return prom.then(function () {
    return when.all([
      nodefn.call(fs.remove, config.debugBuildPath),
      nodefn.call(fs.remove, config.releaseBuildPath),
    ]);
  });
};

module.exports = Cleaner;

