var when = require('when');
var _ = require('underscore');

var SequenceTask = require('./sequence-task');

function ParallelTask() {
  var task = SequenceTask.apply(this, arguments);

  task.runTasks = function(tasks) {
    var self = this;
    return when.all(_.map(tasks, function(task) {
      return task.call(self);
    }));
  };

  return task;
}

module.exports = ParallelTask;
