var textJadeTasks = require('./text-jade');

module.exports = function textTasks(lfa) {
  textJadeTasks(lfa);

  lfa.task('js:files:text', ['text:files:*'], function (textFiles) {
    return textFiles
      .pipe(lfa.hook('text:filter:*'));
  });
};
