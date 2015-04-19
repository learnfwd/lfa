var cssTasks = require('./css');
var htmlTasks = require('./html');
var webpackTasks = require('./webpack');
var assetTasks = require('./assets');
var textTasks = require('./text');

module.exports = function coreTasks(lfa) {
  webpackTasks(lfa);
  cssTasks(lfa);
  htmlTasks(lfa);
  assetTasks(lfa);
  textTasks(lfa);

  lfa.task('default', ['default:*'], function (deps) {
    this.setDependencyMode(deps, 'modify');
    return deps;
  });
};
