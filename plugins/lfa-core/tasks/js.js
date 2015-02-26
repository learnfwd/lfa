var requirejsTasks = require('./js-require');

module.exports = function jsTasks(lfa) {
  requirejsTasks(lfa);

  lfa.task('default:js', ['js:files:*'], function (jsFiles) {
    return jsFiles 
      .pipe(lfa.hook('js:filter:*'))
      .pipe(lfa.hook('js:pre-write:*'))
      .pipe(lfa.dst(lfa.currentCompile.buildPath))
      .pipe(lfa.hook('js:post-write:*'));
  });
};
