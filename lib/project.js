var Config = require('./config');
var _ = require('underscore');
var when = require('when');
var EventEmitter = require('./event-emitter');
var util = require('util');
var browserSync = require('browser-sync');
var nodefn = require('when/node');
var gaze = require('gaze');

function Project(dir, config) {
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

util.inherits(Project, EventEmitter);

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

Project.prototype.compile = function(opts) {
  var self = this;
  self.emit('compile-start');
  return when(self.target.compile(opts))
    .then(function() {
      self.emit('compile-done');
    }, function(err) {
      self.emit('compile-error', err);
      throw err;
    });
};

Project.prototype.stopWatch = function() {
};

Project.prototype.watch = function(opts) {
  var self = this;
  opts = opts || {};
  _.defaults(opts, {
    open: false,
    delay: 100,
    debug: true,
  });

  return self.compile({incrementalBuild: true, debug:opts.debug})
    .then(function() {
      self.emit('server-start');
      var config = {
        server: {
          baseDir: self.config.outputDir,
        },
        open: opts.open,
        port: opts.port,
      };
      return nodefn.call(browserSync, config);
    })
    .then(function() {
      self.emit('server-done');
    }, function(err) {
      self.emit('server-error', err);
      throw err;
    })
    .then(function() {
      var changed = [];
      var timer = null;
      var compiling = false;
      var needsRecompile = true;
      var needsFullBuild = false;

      function recompile() {
        timer = null;
        needsRecompile = false;
        if (compiling) {
          needsRecompile = true;
          return;
        }

        var files = _.uniq(changed);
        changed.length = 0;

        compiling = true;
        self.compile({
          incrementalBuild: true,
          changedPaths: needsFullBuild ? undefined : files,
          debug: opts.debug
        })
          .then(function(changedOutFiles) { 
            needsFullBuild = false; 
            if (!needsRecompile) {
              browserSync.reload(changedOutFiles);
            }
          }, function(err) {
            needsFullBuild = true; 
            if (!needsRecompile) {
              browserSync.notify('<pre style="text-align:left">' + err.toString() + '</pre>', 60000);
            }
          }) 
          .then(function() {
            compiling = false;
            if (needsRecompile) {
              recompile();
            }
          });
      }

      self.emit('watcher-start');
      return nodefn.call(gaze, self.target.watchPatterns(), {cwd: self.inputDir})
        .then(function(watcher) {
          watcher.on('all', function(evt, filepath) {
            changed.push(filepath);
            if (timer) {
              clearTimeout(timer);
            }
            timer = setTimeout(recompile, opts.delay);
          });
        })
        .then(function() { 
          self.emit('watcher-done');
        }, function(err) {
          self.emit('watcher-error', err);
          throw err;
        });
    });
};

Project.prototype.addExtension = function(ext) {
  this.config.addExtension(ext);
};

Project.prototype.addTarget = function(key, target) {
  this.targets[key] = target;
};

module.exports = Project;
