var cssTasks = require('./css');
var htmlTasks = require('./html');
var webpackTasks = require('./webpack');
var assetTasks = require('./assets');

module.exports = function coreTasks(lfa) {
  cssTasks(lfa);
  htmlTasks(lfa);
  webpackTasks(lfa);
  assetTasks(lfa);

  lfa.task('default', ['default:*'], function (deps) {
    return deps;
  });
};
