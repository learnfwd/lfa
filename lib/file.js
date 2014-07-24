function File(target) {
  this.target = target;
  this.project = target.project;
  this.task = null;
}

File.prototype.setTask = function(task) {
  this.task = task;
};

module.exports = File;
