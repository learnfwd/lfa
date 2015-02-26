var util = require('util');
var EventEmitter = require('events').EventEmitter;
var when = require('when');
var _ = require('lodash');

function Watcher(lfa, opts) {
  this.lfa = lfa;
  this.opts = opts;
}

util.inherits(Watcher, EventEmitter);

function _compile(ops) {
  var self = this;
  ops = ops || {};
  ops.added = ops.added || [];
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
      self.waitForCompile = when.promise();
    });
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
    traverse(op.added, 0, 1);
    traverse(op.removed, 1, 0);
    traverse(op.changed, 1, 1);
  });

  var stateMachine = [[null, 'added'], ['removed', 'changed']];
  var op = {
    added: [],
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
  if (this.started) { return; }

  this.fileOps = [];
  this.incrementalCache = null;

  _compile.call(this);

  this.emit('started');
};

Watcher.prototype.stop = function stop() {
  var self = this;
  if (!self.started || self.stopping) { return; }
  self.stopping = true;

  self.emit('stopping');

  self.waitForCompile.then(function () {
    self.stopping = false;
    self.started = false;
    self.emit('stopped');
  });
};

module.exports = {
  watch: function (opts) {
    return new Watcher(this, opts);
  }
};
