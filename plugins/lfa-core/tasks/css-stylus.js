var through2 = require('through2');
var path = require('path');
var gulpStylus = require('gulp-stylus');
var gulpUtil = require('gulp-util');
var when = require('when');
var nodefn = require('when/node');
var fs = require('fs');
var _ = require('lodash');

module.exports = function stylusTasks(lfa) {
  var config = lfa.config;
  config.stylus = config.stylus || {};
  config.stylus.use = config.stylus.use || [];

  lfa.task('css:stylus:files:main', function () {
    return lfa.src(path.resolve(__dirname, '..', 'css', 'index.styl'));
  });

  lfa.task('css:compiler:stylus', ['css:stylus:files:*'], function (stylusFiles) {
    var theme = (lfa.theme.files['theme-styles'] === 'dir') ? lfa.theme : lfa.defaultTheme;

    var opts = _.cloneDeep(config.stylus);
    opts.define = opts.define || {};

    opts.paths = opts.paths || [];
    opts.paths.push(config.projectPath);
    opts.paths.push(theme.path);

    function exists(key, userPath) {
      return nodefn.call(fs.stat, userPath).then(function (stat) {
        opts.define[key] = stat.isFile();
      }).catch(function () {
        opts.define[key] = false;
      });
    }

    opts.define.theme = theme.files[path.join('theme-styles', 'main.styl')] === 'file';
    opts.define.themeOverrides = theme.files[path.join('theme-styles', 'colors.styl')] === 'file';

    var checks = when.all([
      exists('user', path.join(config.projectPath, 'styles', 'main.styl')),
      exists('userOverrides', path.join(config.projectPath, 'styles', 'colors.styl')),
    ]);

    var returnStream = gulpUtil.noop();

    // Delay the compilation pipeline until we finish all the checks
    stylusFiles.pipe(through2.obj(function (file, enc, cb) {
      var thisStream = this;
      checks.then(function () {
        // I can only set up the pipe chain here because "opts" is only ready
        // after the checks are done
        thisStream
          .pipe(gulpStylus(opts))
          .pipe(returnStream);
        cb(null, file);
      });
    }));

    return returnStream;
  });
};
