var textJadeTasks = require('./text-jade');

module.exports = function textTasks(lfa) {
  textJadeTasks(lfa);

  lfa.task('default:text', ['text:files:*'], function (textFiles) {
    return textFiles
      .pipe(lfa.hook('text:filter:*'))
      .pipe(lfa.hook('pre-write:*'))
      .pipe(lfa.hook('text:pre-write:*'))
      .pipe(lfa.dst(lfa.currentCompile.buildPath))
      .pipe(lfa.hook('text:post-write:*'))
      .pipe(lfa.hook('post-write:*'));
  });
};
