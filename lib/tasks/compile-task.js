var _ = require('underscore');
var accord = require('accord');
var path = require('path');
var assert = require('assert');
require('colors');

var compilerNames = ['jade', 'stylus'];
var compilers = _.map(compilerNames, function(compilerName) {
  var c = accord.load(compilerName);
  c.name = compilerName;
  return c;
});

function CompileTask() {
  var self = this;
  if (!self.destPath) { return; }
  var extension = path.extname(self.destPath).replace(/^./, '');
  var compatibleCompilers = _.filter(compilers, function(compiler) {
    return _.contains(compiler.extensions, extension);
  });
  if (!compatibleCompilers.length) { return; }
  if (compatibleCompilers.length > 1) {
    console.log('warning: '.yellow + 'more than one compiler found for "' + self.sourceFullPath.grey + '"');
  }

  var compiler = compatibleCompilers[0];
  self.destPath = self.destPath.replace(new RegExp(extension + '$'), compiler.output);

  var localOptions = {};
  var globalOptions = {};
  try { localOptions = self.compilerOptions[compiler.name]; } catch(ex) {}
  try { globalOptions = self.project.config.compilerOptions[compiler.name]; } catch(ex) {}

  var options = _.extend(localOptions, globalOptions);

  return self.readContents().then(function(content) {
    return compiler.render(content, options);
  }).then(function(content) {
    self.content = content;
  });
}

module.exports = CompileTask;
