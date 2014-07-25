var _ = require('underscore');
var path = require('path');

function Config(project, config) {
  var defaults = {
    outputDir: path.join(project.inputDir, '.lfa', 'build'),
    ignores: ['.DS_Store', 'node_modules', '/.lfa', '/app.js', '.*.sw*', '.git*'],
    target: 'default',
  };
  _.extend(this, defaults, config || {});

  this.initBasicExtensions(project);
}

Config.prototype.initBasicExtensions = function(project) {
  project.addExtension(require('./extensions/default-target'));
};

module.exports = Config;
