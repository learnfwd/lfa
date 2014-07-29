var _ = require('underscore');

function SequenceTask(tasks) {
  tasks = tasks || [];

  function task() {
    return task.runTasks.call(this, tasks);
  }

  task.addTask = function(task) {
    tasks.push(task);
  };

  task.runTasks = function(tasks) {
    var self = this;
    var pipeFake = function(dest) { return dest; };
    var prevTask = { pipeErr: pipeFake, pipe:pipeFake };

    _.each(tasks, function(task) {
      task = task.call(self, prevTask);
      if (task) {
        prevTask = task;
      }
    });
    return prevTask;
  };

  return task;
}

module.exports = SequenceTask;
