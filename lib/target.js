var readdirp = require('readdirp');
var nodefn = require('when/node');
var minimatch = require('minimatch');
var path = require('path');
var File = require('./file');
var _ = require('underscore');
var when = require('when');
var EventEmitter = require('./event-emitter');
var Stream = require('./stream');

function Target(project) {
  this.project = project;
  this.files = [];
}

Target.prototype = Object.create(EventEmitter.prototype);
Target.prototype.constructor = Target;

Target.prototype.collectProjectFiles = function(dir, ignores, destination) {
  var self = this;
  dir = dir || self.project.inputDir;
  ignores = ignores || [];
  ignores.push.apply(ignores, self.project.config.ignores);

  function filter(obj) {
    for (var i = 0, n = ignores.length; i < n; i++) {
      if (minimatch('/' + obj.path, ignores[i], { matchBase: true })) {
        return false;
      }
    }
    return true;
  }

  return nodefn.call(readdirp, {
    root: dir,
    directoryFilter: filter,
    fileFilter: filter,
  }).then(function(result) {
    var res = [];
    for (var i = 0, v = result.files, n = v.length; i < n; i++) {
      var r = v[i];
      var file = new File(self);
      file.destPath = destination ? path.join(destination, r.path) : r.path;
      file.sourceFullPath = r.fullPath;
      res.push(file);
      self.addFile(file);
    }
    return res;
  });
};

Target.prototype.compile = function() {
};

Target.prototype.addFile = function(f) {
  this.files.push(f);
};

Target.prototype.addFiles = function(files) {
  _.each(files, function(f) {
    this.addFile(f);
  });
};

Target.prototype.runTasks = function() {
  var self = this;
  return self.emitPromised('runTasks', self)
    .then(function() {
      return when.all(_.map(self.files, function(file) {
        return when.promise(function(resolve, reject) {
          var stream = file.task();
          when(stream).then(function (str) {
            if (!str) { return; }
            if (str instanceof EventEmitter) {
              str.on('error', reject);
            }
            if (str instanceof Stream.Writable) {
              str.on('finish', resolve);
            } else if (str instanceof Stream.Readable) {
              str.on('done', resolve);
            }
          });
        });
      }));
    });
};

module.exports = Target;
