var when = require('when');
var stream = require('stream');

function File(target, workflow) {
  this.target = target;
  this.project = target.project;
  this.task = null;
  this.workflow = workflow || 'default';
}

File.prototype.setTask = function(task) {
  this.task = task;
};

module.exports = File;
