var Target = require('../target');
var util = require('util');
var when = require('when');

function DefaultTarget() {
  Target.apply(this, arguments);
}
DefaultTarget.prototype = Object.create(Target.prototype);
DefaultTarget.prototype.constructor = DefaultTarget;

DefaultTarget.prototype.compile = function() {
  var self = this;
  return when.try(
    self.collectProjectFiles.bind(self)
  ).then(function() {
    console.log('compiling some files:');
    console.log(self.files);
  });
};

// Extension boilerplate 

function _extension(project) {
  project.addTarget('default', DefaultTarget);
}
_extension.DefaultTarget = DefaultTarget;
module.exports = _extension;
