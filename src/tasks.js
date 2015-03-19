var vfs = require('vinyl-fs');
var minimatch = require('minimatch');
var _ = require('lodash');
var gutil = require('gulp-util');
var es = require('event-stream');
var pipeErrors = require('./pipe-errors');
var glob = require('glob');
var glob2base = require('glob2base');
var through = require('through2');

function Task(opts) {
  var self = this;
  self.name = opts.name;
  self.dependencies = opts.dependencies;
  self.fn = opts.fn;
  self.lfa = opts.lfa;
  self.dependencyModes = [];
  for (var i = 0, n = self.dependencies.length; i < n; i++) {
    self.dependencyModes.push('cache');
  }
}

Task.prototype.addFileDependencies = function addFileDependencies(files) {
  var cache = this.lfa._newCache;
  if (!cache) { return; }

  if (typeof(files) !== 'object') {
    files = [files];
  }

  if (files instanceof Array) {
    var o = {};
    _.each(files, function(f) { o[f] = 'all'; });
    files = o;

  }

  var cacheEntry = cache[this.name];
  var fd = cacheEntry.fileDeps;
  if (!fd) { fd = cacheEntry.fileDeps = {}; }

  _.each(files, function (types, f) {
    if (types === 'all') { types = ['created', 'removed', 'changed']; }
    var t = {};
    _.each(types, function (o) { t[o] = true; });
    if (fd[f]) {
      t = _.extend(t, fd[f]);
    }
    fd[f] = t;
  });
};

Task.prototype.filterModifiedFiles = function filterModifiedFiles(globs) {
  if (!this.lfa._oldCache) { return globs; }

  var res = [];
  if (typeof(globs) === 'string') { globs = [globs]; }
  var ops = this.lfa._fileOps;

  _.each(['changed', 'created'], function (action) {
    _.each(ops[action] || [], function (file) {
      if (_.reduce(globs, function (acc, glob) {
        return acc || minimatch(file, glob);
      }, false)) {
        res.push(file);
      }
    });
  });
  return res;
};

Task.prototype.matchesFileOps = function matchesFileOps(ops) {
  var fileDeps = this.lfa._oldCache[this.name].fileDeps;
  if (!fileDeps) { return false; }

  var actions = ['changed', 'created', 'removed'];
  for (var i = 0; i < actions.length; i++) {
    var action = actions[i];
    var files = ops[action];
    for (var j = 0, n = files.length; j < n; j++) {
      var file = files[j];
      for (var glob in fileDeps) {
        if (fileDeps[glob][action] && minimatch(file, glob)) {
          return true;
        }
      }
    }
  }
  return false;
};

Task.prototype.setDependencyMode = function setDependencyMode(stream, mode) {
  this.dependencyModes[stream._dependencyIndex] = mode;
};

Task.prototype.run = function run(dependencies) {
  return this.fn.apply(this, dependencies);
};

var LFATasks = {
  dst: vfs.dest,
  pipeErrors: pipeErrors,

  // This is needed because base paths get messed up if you change the globs
  src: function (globs, opts) {
    opts = opts || {};

    if (!this._oldCache || !opts.filterModified) {
      return pipeErrors(vfs.src(globs, opts));
    }

    var filteredGlobs = opts.filterModified.filterModifiedFiles(globs);
    if (typeof(globs) === 'string') { globs = [globs]; }
    var basePaths = _.map(globs, function (g) {
      return glob2base(new glob.Glob(g));
    });

    return pipeErrors(vfs.src(filteredGlobs, opts))
      .pipe(through.obj(function (file, enc, cb) {
        for (var i = 0, n = globs.length; i < n; i++) {
          if (minimatch(file.path, globs[i])) {
            file.base = basePaths[i];
          }
        }
        cb(null, file);
      }));
  },

  emptyStream: function () {
    var s = pipeErrors(gutil.noop());
    process.nextTick(function () {
      s.end();
    });
    return s;
  },

  task: function (name, deps, cb) {
    if (typeof(deps) === 'function') {
      cb = deps;
      deps = [];
    }

    var task = new Task({
      name: name,
      dependencies: deps,
      fn: cb,
      lfa: this,
    });

    this._tasks[name] = task;
    this._taskArray.push(name);
  },

  solve: function (glob) {
    var filter;

    if ((typeof glob === 'object') && (glob instanceof Array)) {
      filter = function (task) {
        for (var i = 0, n = glob.length; i < n; i++) {
          if (minimatch(task, glob[i])) {
            return true;
          }
        }
        return false;
      };
    } else {
      filter = minimatch.filter(glob);
    }

    return this._taskArray.filter(filter);
  },

  hook: function(glob) {
    var r = pipeErrors(gutil.noop());
    var self = this;
    _.each(this.solve(glob), function (task) {
      var stream = self._start(task, r);
      r = r.pipe(stream);
    });
    return r;
  },

  start: function (task, opts) {
    return this._startIncremental(task, opts).stream;
  },

  _createCache: function() {
    var cache = {};
    _.each(this._taskArray, function(taskName) {
      cache[taskName] = {};
    });
    return cache;
  },

  _mergeCache: function(newCache, oldCache) {
    if (!oldCache) { return; }
    _.each(this._taskArray, function(taskName) {
      var newEntry = newCache[taskName];
      var oldEntry = oldCache[taskName];
      if (!newEntry.fileDeps && oldEntry.fileDeps) {
        newEntry.fileDeps = oldEntry.fileDeps;
      }
    });
  },

  startIncremental: function (task, opts) {
    opts = opts || {};
    this._taskResults = {};
    this._localCache = this._createCache();
    this._oldCache = opts.cache;
    this._newCache = opts.saveCache ? this._createCache() : null;
    this._fileOps = opts.fileOps;
    var r = {
      stream: this._start(task, null, !!opts.cache),
      cache: this._newCache,
    };
    this._mergeCache(this._newCache, this._oldCache);
    this._oldCache = null;
    this._newCache = null;
    this._taskResults = null;
    this._fileOps = null;
    this._localCache = null;
    return r;
  },

  _needsRerun: function(name) {
    var self = this;
    var cacheEntry = this._localCache[name];

    if (cacheEntry.needsRerun === undefined) {
      var task = this._tasks[name];
      if (task.matchesFileOps(this._fileOps)) {
        cacheEntry.needsRerun = 2; //we've reached a leaf
      } else {
        cacheEntry.needsRerun = _(task.dependencies)
          .map(function (dep) {
            return _.map(self.solve(dep));
          })
          .flatten()
          .map(function (dep) { return self._needsRerun(dep); })
          .reduce(function (acc, val) { return acc || !!val; }, false);
      }
    }

    return cacheEntry.needsRerun;
  },

  _start: function (taskName, input, incremental) {
    var self = this;

    var r = this._taskResults[taskName];
    if (r) {
      return r;
    }

    var task = this._tasks[taskName];

    if (!task) {
      throw new Error('No such task: "' + taskName + '"');
    }

    var dependencies = _.map(task.dependencies, function (glob, idx) {
      var mode;

      if (incremental) {
        mode = task.dependencyModes[idx];
        if (mode === 'none') {
          return self.emptyStream();
        }
      }

      var streams = _.map(self.solve(glob), function (dependency) {
        if (incremental && (mode === 'cache' || mode === 'modify')) {
          var rerun = self._needsRerun(dependency);
          switch (rerun) {
            case 2: //leaf
              return self._start(dependency, null, false);
            case false:
              if (mode === 'modify') { 
                return self.emptyStream();
              }

              var cache = self._oldCache[dependency];
              if (cache) { cache = cache.cacheReplay; }
              if (cache) { return cache.replay(); }
              return self._start(dependency, null, true);

            case true:
              return self._start(dependency, null, true);
          }
        }
        return self._start(dependency, null, incremental && (mode !== 'run'));
      });

      if (streams.length === 0) {
        return self.emptyStream();
      } else if (streams.length === 1) {
        return pipeErrors(streams[0]);
      } else {
        return es.merge.apply(es, streams);
      }
    });

    _.each(dependencies, function(dep, idx) {
      dep._dependencyIndex = idx;
    });

    if (input !== undefined) {
      dependencies.push(input);
    }

    r = task.run(dependencies);
    this._taskResults[taskName] = r;
    return r;
  },

  _initTasks: function () {
    this._tasks = {};
    this._taskArray = [];
  }
};

module.exports = LFATasks;

