var util = require('util');
var EventEmitter = require('events').EventEmitter;
var when = require('when');
var _ = require('lodash');
var fileMonitor = require('./file-monitor');

function Watcher(lfa, opts) {
  this.lfa = lfa;
  this.opts = opts;
}

util.inherits(Watcher, EventEmitter);

function _compile(ops) {
  var self = this;
  ops = ops || {};
  ops.created = ops.created || [];
  ops.removed = ops.removed || [];
  ops.changed = ops.changed || [];

  var opts = _.extend({
    incrementalCache: self.incrementalCache,
    fileOperations: ops,
    returnIncremental: true,
  }, self.opts);

  self.emit('compiling');

  self.waitForCompile = self.lfa.compile(opts)
    .then(function (cache) {
      self.incrementalCache = cache;
      self.emit('compile-done');
    })
    .catch(function (err) {
      self.incrementalCache = null;
      self.emit('compile-error', err);
    })
    .finally(function () {
      self.waitForCompile = when();
    });

  return self.waitForCompile;
}

function _mergeFileOperations(ops) {
  var files = {};
  if (ops.length === 1) { return ops[0]; }

  function traverse(array, prevState, newState) {
    _.each(array || [], function (file) {
      var spec = files[file];
      if (!spec) {
        files[file] = spec = { initialState: prevState };
      }
      spec.state = newState;
    });
  }

  _.each(ops, function (op) {
    traverse(op.created, 0, 1);
    traverse(op.removed, 1, 0);
    traverse(op.changed, 1, 1);
  });

  var stateMachine = [[null, 'created'], ['removed', 'changed']];
  var op = {
    created: [],
    removed: [],
    changed: [],
  };

  _.each(files, function(spec, file) {
    var state = stateMachine[spec.initialState][spec.state];
    if (state) {
      op[state].push(file);
    }
  });

  return op;
}

function _resolveChangeEvent() {
  var self = this;
  if (self.fileOps.length === 0) { return; }
  var ops = _mergeFileOperations(self.fileOps);
  _compile.call(this, ops);
}

function _filesChanged(ops) {
  this.fileOps.push(ops);
  this.waitForCompile.then(_resolveChangeEvent.bind(this));
}

Watcher.prototype.start = function start() {
  var self = this;
  if (self.started) { return; }

  self.fileOps = [];
  self.incrementalCache = null;

  self.waitForCompile = fileMonitor(self.lfa.config.projectPath, _filesChanged.bind(self))
    .then(function (monitor) {
      self.monitor = monitor;
      return _compile.call(self);
    });

  self.emit('started');
};

Watcher.prototype.stop = function stop() {
  var self = this;
  if (!self.started || self.stopping) { return; }
  self.stopping = true;

  self.emit('stopping');

  if (self.monitor) {
    self.monitor.close();
    self.monitor = null;
  }

  self.waitForCompile.then(function () {
    self.stopping = false;
    self.started = false;
    if (self.monitor) {
      self.monitor.close();
    }
    self.emit('stopped');
  });
};

module.exports = {
  watch: function (opts) {
    return new Watcher(this, opts);
  }
};
