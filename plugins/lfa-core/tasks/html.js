var indexHtmlTasks = require('./index-html');

module.exports = function htmlTasks(lfa) {
  indexHtmlTasks(lfa);

  lfa.task('default:html', ['html:compiler:*'], function (htmlFiles) {
    return htmlFiles
      .pipe(lfa.hook('html:pre-write:*'))
      .pipe(lfa.dst(lfa.config.buildPath))
      .pipe(lfa.hook('html:post-write:*'));
  });
};
