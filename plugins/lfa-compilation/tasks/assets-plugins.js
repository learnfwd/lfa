var path = require('path');
var _ = require('lodash');

module.exports = function defaultAssetsTasks(lfa) {
  var config = lfa.config;

  lfa.task('assets:files:plugins', function () {
    var assetPaths = [];
    var confAssetPaths = lfa.currentCompile.assetPaths = lfa.currentCompile.assetPaths || [];

    _.each(lfa.plugins, function (plugin) {
      var p = path.join(plugin.path, 'frontend', 'assets');
      assetPaths.push(p);
      confAssetPaths.push(p);
    });

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
