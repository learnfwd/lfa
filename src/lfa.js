var _ = require('lodash');
var when = require('when');

function LFA(src, dst) {
  this.projectPath = src;
  this.outputPath = dst;
  this._initTasks();
}

_.extend(LFA.prototype, require('./tasks'));

LFA.detectPaths = function (projPath) {
  return when({
    projectPath: projPath,
  });
};

module.exports = LFA;
