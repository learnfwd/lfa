var _ = require('underscore');
var path = require('path');

function Config(project, config) {
  var defaults = {
    outputDir: path.join(project.inputDir, '.lfa', 'build'),
    ignores: ['**/.DS_Store', '.lfa', 'app.js', '**/.*.sw*', '_'],
    watcherIgnores: ['**/.DS_Store', '.lfa', 'app.js', '**/.*.sw*'],
    target: 'default',
  };
  _.extend(this, defaults, config || {});

  this.initBasicExtensions(project);
}

Config.prototype.initBasicExtensions = function(project) {
  project.addExtension(require('./extensions/target'));
};

module.exports = Config;
