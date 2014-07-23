
// Target

function Target(project) {
  this.project = project;
}

Target.prototype.compile = function() {
}

// DefaultTarget

function DefaultTarget() {
  Target.call(this, arguments);
}
DefaultTarget.prototype = Object.create(Target);
DefaultTarget.constructor = DefaultTarget;

DefaultTarget.prototype.compile = function() {
  console.log('compiling something');
};

// Extension boilerplate 

function _extension(project) {
  project.addTarget('default', DefaultTarget);
}
_extension.DefaultTarget = DefaultTarget;
module.exports = _extension;
