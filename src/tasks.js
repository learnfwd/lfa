var vfs = require('vinyl-fs');
var minimatch = require('minimatch');
var _ = require('lodash');
var gutil = require('gulp-util');
var es = require('event-stream');
var pipeErrors = require('./pipe-errors');

var LFATasks = {
  src: pipeErrors.patchFunction(vfs.src),
  dst: vfs.dest,
  pipeErrors: pipeErrors,

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

    this._tasks[name] = {
      name: name,
      dependencies: deps,
      fn: cb,
    };

    this._taskArray.push(name);
  },

  solve: function (glob) {
    return this._taskArray.filter(minimatch.filter(glob));
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

  start: function (task) {
    this._taskResults = {};
    var r = this._start(task);
    this._taskResults = null;
    return r;
  },

  _start: function (task, input) {
    var self = this;

    var r = this._taskResults[task];
    if (r) {
      return r;
    }

    var spec = this._tasks[task];

    if (!spec) {
      throw new Error('No such task: "' + task + '"');
    }

    var dependencies = _.map(spec.dependencies, function (glob) {
      var streams = _.map(self.solve(glob), function (dependency) {
        return self._start(dependency);
      });

      if (streams.length === 0) {
        return self.emptyStream();
      } else if (streams.length === 1) {
        return pipeErrors(streams[0]);
      } else {
        return es.merge.apply(es, streams);
      }
    });

    if (input !== undefined) {
      dependencies.push(input);
    }

    r = spec.fn.apply(null, dependencies);
    this._taskResults[task] = r;
    return r;
  },

  _initTasks: function () {
    this._tasks = {};
    this._taskArray = [];
  }
};

module.exports = LFATasks;

