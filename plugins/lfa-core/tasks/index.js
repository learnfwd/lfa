var cssTasks = require('./css');
var htmlTasks = require('./html');
var jsTasks = require('./js');
var assetTasks = require('./assets');

module.exports = function coreTasks(lfa) {
  cssTasks(lfa);
  htmlTasks(lfa);
  jsTasks(lfa);
  assetTasks(lfa);

  lfa.task('default', ['default:*'], function (deps) {
    return deps;
  });
};
