var webpackTasks = require('./webpack');
var assetTasks = require('./assets');

module.exports = function coreTasks(lfa) {
  webpackTasks(lfa);
  assetTasks(lfa);

  lfa.task('default', ['default:*'], function (deps) {
    this.setDependencyMode(deps, 'modify');
    return deps;
  });
};
