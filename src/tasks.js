var vfs = require('vinyl-fs');
var minimatch = require('minimatch');
var _ = require('lodash');
var gutil = require('gulp-util');
var es = require('event-stream');

var LFATasks = {
  src: vfs.src,
  dst: vfs.dest,

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
    var r = gutil.noop();
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

    var r = this._results[task];
    if (r) {
      return r;
    }

    gutil.log(task, 'Running dependencies...');

    var spec = this._tasks[task];

    var dependencies = _.map(spec.dependencies, function (glob) {
      var streams = _.map(self.solve(glob), function (dependency) {
        return self._start(dependency);
      });

      if (streams.length === 0) {
        return gutil.noop();
      } else if (streams.length === 1) {
        return streams[0];
      } else {
        return es.merge.apply(es, streams);
      }
    });

    if (input !== undefined) {
      dependencies.push(input);
    }

    gutil.log(task, 'Running...');
    spec.fn.apply(null, dependencies);
    gutil.log(task, 'Finished');
    this._taskResults[task] = r;
    return r;
  },

  _initTasks: function () {
    this._tasks = {};
    this._taskArray = [];
  }
};

module.exports = LFATasks;

