var Target = require('../target');
var when = require('when');
var _ = require('underscore');
var ReadTask = require('../tasks/read-task');
var WriteTask = require('../tasks/write-task');
var ParallelTask = require('../tasks/parallel-task');
var SequenceTask = require('../tasks/sequence-task');

function DefaultTarget() {
  Target.apply(this, arguments);
}
DefaultTarget.prototype = Object.create(Target.prototype);
DefaultTarget.prototype.constructor = DefaultTarget;

DefaultTarget.prototype.buildFileList = function() {
  return this.collectProjectFiles();
};

DefaultTarget.prototype.configureFile = function(task) {
  task.addTask(ReadTask);
  //task.addTask(CompileTask);
  task.addTask(WriteTask);
};

DefaultTarget.prototype.compile = function() {
  var self = this;
  return when.try(
    self.buildFileList.bind(self)
  ).then(function(files) {
    var globalTask = ParallelTask();
    _.each(files, function(file) {
      var task = SequenceTask();
      self.configureFile(task, file);
      file.setTask(task);
      globalTask.addTask(task.bind(file));
    });
    return globalTask();
  });
};

// Extension boilerplate 

function _extension(project) {
  project.addTarget('default', DefaultTarget);
}
_extension.DefaultTarget = DefaultTarget;
module.exports = _extension;
