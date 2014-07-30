var _ = require('underscore');
var path = require('path');
var EventEmitter = require('./event-emitter');
var when = require('when');

function Config(project, config) {
  var self = this;
  self.loaded = when.promise(function(resolve, reject) {
    var defaults = {
      outputDir: path.join(project.inputDir, '.lfa', 'build'),
      ignores: ['.DS_Store', 'node_modules', '/.lfa', '/lfa.json', '.*.sw*', '.git*'],
      target: 'default',
      compilers: ['jade', 'stylus', 'coffee-script'],
      extensions: [],
    };
    _.extend(self, defaults, config || {});

    self.initBasicExtensions();

    resolve(self);
  });
}
Config.prototype = Object.create(EventEmitter.prototype);
Config.prototype.constructor = Config;

Config.prototype.addExtension = function(ext) {
  this.extensions.push(ext);
};

Config.prototype.initBasicExtensions = function() {
  this.addExtension(require('./extensions/default-target'));
};

module.exports = Config;
