var defaultAssetsTasks = require('./assets-default');

module.exports = function assetsTasks(lfa) {
  defaultAssetsTasks(lfa);

  lfa.task('default:assets', ['assets:files:*'], function (files) {
    this.setDependencyMode(files, 'modify');
    return files 
      .pipe(lfa.hook('assets:filter:*'))
      .pipe(lfa.hook('pre-write:*'))
      .pipe(lfa.hook('assets:pre-write:*'))
      .pipe(lfa.dst(lfa.currentCompile.buildPath))
      .pipe(lfa.hook('assets:post-write:*'))
      .pipe(lfa.hook('post-write:*'));
  });
};
