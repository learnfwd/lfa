var indexHtmlTasks = require('./html-index');

module.exports = function htmlTasks(lfa) {
  indexHtmlTasks(lfa);

  lfa.task('default:html', ['html:files:*'], function (htmlFiles) {
    this.setDependencyMode('modify');
    return htmlFiles
      .pipe(lfa.hook('html:filter:*'))
      .pipe(lfa.hook('pre-write:*'))
      .pipe(lfa.hook('html:pre-write:*'))
      .pipe(lfa.dst(lfa.currentCompile.buildPath))
      .pipe(lfa.hook('html:post-write:*'))
      .pipe(lfa.hook('post-write:*'));
  });
};
