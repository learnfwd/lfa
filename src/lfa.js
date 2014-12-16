var vfs = require('vinyl-fs');
var minimatch = require('minimatch');
var _ = require('lodash');
var gutil = require('gulp-util');
var es = require('event-stream');

function LFA(src, dst) {
  this.tasks = {};
  this.projectPath = src;
  this.outputPath = dst;
}

LFA.prototype.src = vfs.src;
LFA.prototype.dest = vfs.dest;

LFA.prototype.task = function (name, deps, cb) {
  if (typeof(deps) === 'function') {
    cb = deps;
    deps = [];
  }

  this.tasks[name] = {
    name: name,
    dependencies: deps,
    fn: cb,
  };
};

LFA.prototype.solve = function (glob) {
  return _.keys(this.tasks).filter(minimatch.filter(glob));
};

LFA.prototype._start = function (task, input) {
  var self = this;

  if (this.results[task]) {
    return this.results[task];
  }

  gutil.log(task, 'Running dependencies...');

  var spec = this.tasks[task];

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
  var r = spec.fn.apply(null, dependencies);
  gutil.log(task, 'Finished');
  this.results[task] = r;
  return r;
};

LFA.prototype.hook = function(glob) {
  var r = gutil.noop();
  var self = this;
  _.each(this.solve(glob), function (task) {
    var stream = self._start(task, r);
    r = r.pipe(stream);
  });
  return r;
};

LFA.prototype.start = function (task) {
  this.results = {};
  var r = this._start(task);
  this.results = null;
  return r;
};

module.exports = LFA;
