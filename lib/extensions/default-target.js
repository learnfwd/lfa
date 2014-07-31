var Target = require('../target');
var _ = require('underscore');
var ReadTask = require('../tasks/read-task');
var WriteTask = require('../tasks/write-task');
var SequenceTask = require('../tasks/sequence-task');
var CompileTask = require('../tasks/compile-task');

function DefaultTarget() {
  Target.apply(this, arguments);
  this.on('buildFileList', this.collectProjectFiles.bind(this));
}
DefaultTarget.prototype = Object.create(Target.prototype);
DefaultTarget.prototype.constructor = DefaultTarget;

DefaultTarget.prototype.buildFileList = function() {
  return this.emitPromised('buildFileList');
};

DefaultTarget.prototype.configureDefaultFilePreCompile = function(/*file, task*/) {
};

DefaultTarget.prototype.configureDefaultFilePostCompile = function(/*file, task*/) {
};

DefaultTarget.prototype.configureFile = function(file, task) {
  this.emit('configureFile', file, task);
  if (file.workflow === 'default') {
    this.emit('beforeReadTask', file, task);
    task.addTask(ReadTask);
    this.emit('afterReadTask', file, task);

    this.configureDefaultFilePreCompile(file, task);

    this.emit('beforeCompileTask', file, task);
    task.addTask(CompileTask);
    this.emit('afterCompileTask', file, task);

    this.configureDefaultFilePostCompile(file, task);

    this.emit('beforeWriteTask', file, task);
    task.addTask(WriteTask);
    this.emit('afterWriteTask', file, task);
  }
};

DefaultTarget.prototype.compile = function(opts) {
  var self = this;
  self.compileOpts = opts || {};

  if (self.compileOpts.incrementalBuild) {
    console.log('incremental build');
  }
  if (self.compileOpts.changedPaths) {
    console.log('changed paths:', self.compileOpts.changedPaths);
  } else {
    console.log('full build');
  }

  return self.buildFileList()
    .then(self.emitPromised.bind(self, 'configureTasks'))
    .then(function() {
      _.each(self.files, function(file) {
        var task = SequenceTask();
        self.configureFile(file, task);
        file.setTask(task);
      });
    })
    .then(self.emitPromised.bind(self, 'runTasks'))
    .then(self.runTasks.bind(self));
};

// Extension boilerplate 

function _extension(project) {
  project.addTarget('default', DefaultTarget);
}
_extension.DefaultTarget = DefaultTarget;
module.exports = _extension;
