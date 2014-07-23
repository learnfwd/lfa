var readdirp = require('readdirp');
var nodefn = require('when/node');
var minimatch = require('minimatch');
var path = require('path');
var File = require('./file');

function Target(project) {
  this.project = project;
  this.files = [];
}

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
    root: dir ,
    directoryFilter: filter,
    fileFilter: filter,
  }).then(function(result) {
    for (var i = 0, v = result.files, n = v.length; i < n; i++) {
      var r = v[i];
      var file = new File(this);
      file.destPath = destination ? path.join(destination, r.path) : r.path;
      file.sourceFullPath = r.fullPath;
      self.addFile(file);
    }
  });
};

Target.prototype.addFile = function(file) {
  this.files.push(file);
};

Target.prototype.compile = function() {
};

module.exports = Target;
