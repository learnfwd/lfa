var cssTasks = require('./css');
var htmlTasks = require('./html');

module.exports = function coreTasks(lfa) {
  cssTasks(lfa);
  htmlTasks(lfa);

  lfa.task('default', ['default:*'], function (deps) {
    return deps;
  });
};
