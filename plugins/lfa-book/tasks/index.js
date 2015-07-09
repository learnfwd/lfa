var assetsTask = require('./assets');
var indexHtmlTask = require('./html');
var textTasks = require('./text');

var buildInfoTask = require('./js-build-info');
var textVersionsTask = require('./js-text-versions');

var assert = require('assert');

module.exports = function (lfa) {
  var userDeps = lfa.config.package.lfa.dependencies || [];
  assert(userDeps instanceof Array, 'packageJson.lfa.dependencies must be an array');

  var pluginDeps = this.package.lfa.dependencies || [];
  this.package.lfa.dependencies = pluginDeps.concat(userDeps);

  assetsTask(lfa);
  indexHtmlTask(lfa);
  textTasks(lfa);

  buildInfoTask(lfa);
  textVersionsTask(lfa);
};
