var _ = require('underscore');
var accord = require('accord');
var path = require('path');
var util = require('util');
var stream = require('../stream');
require('colors');


function Compiler(options) {
  stream.Transform.call(this, options);
  this.data = [];
  this.compiler = options.compiler;
  this.compilerOptions = options.compilerOptions;
}

util.inherits(Compiler, stream.Transform);

Compiler.prototype._transform = function (chunk, enc, cb) {
  var buffer = (Buffer.isBuffer(chunk)) ? chunk : new Buffer(chunk, enc);
  this.data.push(buffer);
  cb();
};

Compiler.prototype._flush = function (cb) {
  var self = this;
  var dataString = Buffer.concat(this.data).toString('utf8');
  self.compiler.render(dataString, self.compilerOptions)
    .then(function(output) {
      self.push(output, 'utf8');
      cb();
    }, function(err) {
      self.emit('error', err);
    });
};

var compilers = {};
function getCompiler(name) {
  var c = compilers[name];
  if (!c) {
    c = accord.load(name);
    c.name = name;
    compilers[name] = c;
  }
  return c;
}

function CompileTask(stream) {
  var self = this;
  if (!self.destPath) { return; }
  var extension = path.extname(self.destPath).replace(/^./, '');

  var compatibleCompilers = [];
  _.each(self.project.config.compilers, function(compilerName) {
    compiler = getCompiler(compilerName);
    if (_.contains(compiler.extensions, extension)) {
      compatibleCompilers.push(compiler);
    }
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

  return stream.pipeErr(new Compiler({
    compiler: compiler,
    compilerOptions: options
  }));
}

module.exports = CompileTask;
