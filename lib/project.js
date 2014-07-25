var Config = require('./config');
var _ = require('underscore');
var when = require('when');

function Project(dir, config, extensions) {
  this.inputDir = dir || process.cwd();
  this.extensions =  extensions || [];
  this.targets = {};
  this.config = new Config(this, config);
  this.bootstrapExtensions();
  this.target = new this.targets[this.config.target](this);
}

Project.prototype.bootstrapExtensions = function() {
  var self = this;
  _.each(self.extensions, function(Extension, i) {
    self.extensions[i] = new Extension(self);
  });
};

Project.prototype.compile = function() {
  return when(this.target.compile());
};

Project.prototype.addExtension = function(ext) {
  this.extensions.push(ext);
};

Project.prototype.addTarget = function(key, target) {
  this.targets[key] = target;
};

module.exports = Project;
