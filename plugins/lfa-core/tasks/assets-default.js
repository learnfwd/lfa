var path = require('path');
var _ = require('lodash');

module.exports = function defaultAssetsTasks(lfa) {
  var config = lfa.config;

  lfa.task('assets:files:default', function () {
    var assetPaths = [ path.join(config.projectPath, 'assets') ];
    _.each(lfa.plugins, function (plugin) {
      assetPaths.push(path.join(plugin.path, 'frontend', 'assets'));
    });

    lfa.currentCompile.assetPaths = assetPaths;

    var globs = _.map(assetPaths, function (o) {
      return path.join(o, '**');
    });

    this.addFileDependencies(globs);

    if (lfa.currentCompile.serve) {
      lfa.currentCompile.reloadAnyway = true;
      return lfa.emptyStream();
    }

    return lfa.src(globs, { buffer: false, filterModified: this });
  });
};
