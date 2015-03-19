var path = require('path');
var _ = require('lodash');

module.exports = function defaultAssetsTasks(lfa) {
  var config = lfa.config;

  lfa.task('assets:files:default', function () {
    var assetPaths = [ path.join(config.projectPath, 'assets') ];
    _.each(lfa.plugins, function (plugin) {
      assetPaths.push(path.join(plugin.path, 'frontend', 'assets'));
    });

    var globs = _.map(assetPaths, function (o) {
      return path.join(o, '**');
    });

    this.addFileDependencies(globs);
    return lfa.src(globs, { buffer: false, filterModified: this });
  });
};
