var path = require('path');
var _ = require('lodash');

module.exports = function defaultAssetsTasks(lfa) {
  lfa.task('assets:files:user', function () {
    var assetPath = path.join(lfa.config.projectPath, 'assets');

    lfa.currentCompile.assetPaths = lfa.currentCompile.assetPaths || [];
    lfa.currentCompile.assetPaths.push(assetPath);

    var glob = path.join(assetPath, '**');
    this.addFileDependencies(glob);

    if (lfa.currentCompile.serve) {
      lfa.currentCompile.reloadAnyway = true;
      return lfa.emptyStream();
    }

    return lfa.src(glob, { buffer: false, filterModified: this });
  });
};
