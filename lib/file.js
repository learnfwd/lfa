function File(project) {
  this.project = project;
  this.filters = [];
}

File.prototype.addFilter = function(filter) {
  this.filters.push(filter);
};

module.exports = File;
