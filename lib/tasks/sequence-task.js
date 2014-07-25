var sequence = require('when/sequence');
var _ = require('underscore');

function SequenceTask(tasks) {
  tasks = tasks || [];

  function task() {
    task.runTasks.call(this, tasks);
  }

  task.addTask = function(task) {
    tasks.push(task);
  };

  task.runTasks = function(tasks) {
    var self = this;
    return sequence(_.map(tasks, function(task) {
      return task.bind(self);
    }));
  };

  return task;
}

module.exports = SequenceTask;
