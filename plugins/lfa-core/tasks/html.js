var indexHtmlTasks = require('./html-index');

module.exports = function htmlTasks(lfa) {
  indexHtmlTasks(lfa);

  lfa.task('default:html', ['html:files:*'], function (htmlFiles) {
    return htmlFiles
      .pipe(lfa.hook('html:filter:*'))
      .pipe(lfa.hook('html:pre-write:*'))
      .pipe(lfa.dst(lfa.currentCompile.buildPath))
      .pipe(lfa.hook('html:post-write:*'));
  });
};