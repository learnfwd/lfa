var concat = require('gulp-concat');
var defaultAssetsTasks = require('./assets-default');

module.exports = function assetsTasks(lfa) {
  defaultAssetsTasks(lfa);

  lfa.task('default:assets', ['assets:files:*'], function (jsFiles) {
    return jsFiles 
      .pipe(lfa.hook('assets:filter:*'))
      .pipe(lfa.hook('assets:pre-write:*'))
      .pipe(lfa.dst(lfa.currentCompile.buildPath))
      .pipe(lfa.hook('assets:post-write:*'));
  });
};
