var textJadeTasks = require('./text-jade');

module.exports = function textTasks(lfa) {
  textJadeTasks(lfa);

  lfa.task('assets:files:text', ['text:files:*'], function (textFiles) {
    return textFiles
      .pipe(lfa.hook('text:filter:*'));
  });
};
