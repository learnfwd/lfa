var Config = require('./config');
var _ = require('underscore');
var when = require('when');
var EventEmitter = require('./event-emitter');

function Project(dir, config, extensions, callback) {
  var self = this;
  self.loaded = when.promise(function(resolve, reject) {
    self.inputDir = dir || process.cwd();
    self.loadedExtensions = [];
    self.targets = {};
    self.config = new Config(self, config);
    self.config.loaded.done(function () {
      self.emit('loadExtensions', self);
      self.bootstrapExtensions();
      self.emit('loadedExtensions', self);

      self.emit('loadTarget', self);
      self.target = new self.targets[self.config.target](self);
      self.emit('loadedTarget', self);

      resolve(self);
    }, function(err) {
      reject(err);
    });
  });
}
Project.prototype = Object.create(EventEmitter.prototype);
Project.prototype.constructor = EventEmitter;

Project.createProject = function() {
  var defer = when.defer();
  var project = new Project.bind.apply(Project, [null, defer].concat(arguments));
  return { 
    project: project,
    promise: defer.promise
  };
};

Project.prototype.bootstrapExtensions = function() {
  var self = this;
  _.each(self.config.extensions, function(Extension) {
    self.loadedExtensions.push(new Extension(self));
  });
  self.config.extensions.length = 0;
};

Project.prototype.compile = function() {
  return when(this.target.compile());
};

Project.prototype.addExtension = function(ext) {
  this.config.addExtension(ext);
};

Project.prototype.addTarget = function(key, target) {
  this.targets[key] = target;
};

module.exports = Project;
