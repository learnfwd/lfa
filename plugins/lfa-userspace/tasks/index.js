var assetsTask = require('./assets');
var indexHtmlTask = require('./html');
var textTasks = require('./text');

var buildInfoTask = require('./js-build-info');
var textVersionsTask = require('./js-text-versions');

module.exports = function (lfa) {
  assetsTask(lfa);
  indexHtmlTask(lfa);
  textTasks(lfa);

  buildInfoTask(lfa);
  textVersionsTask(lfa);
};
