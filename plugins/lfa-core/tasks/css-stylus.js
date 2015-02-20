var through2 = require('through2');
var path = require('path');
var when = require('when');
var nodefn = require('when/node');
var fs = require('fs');
var _ = require('lodash');
var sourcemaps = require('gulp-sourcemaps');

// Slightly patched version of gulp-stylus that takes per-file options
var gulpStylus = require('./gulp-stylus2');

module.exports = function stylusTasks(lfa) {
  var config = lfa.config;
  config.stylus = config.stylus || {};

  lfa.task('css:stylus:files:entrypoints', function () {
    function fileExists(file) {
      return nodefn.call(fs.stat, file).then(function (stat) {
        return stat.isFile();
      }).catch(function () {
        return false;
      });
    }

    function checkEntrypoint(override, style) {
      return when.all([
        fileExists(override),
        fileExists(style),
      ]).then(function (arr) {
        return {
          override: arr[0] ? override : null,
          style: arr[1] ? style : null,
        };
      });
    }

    var entrypoints = [];

    // Collect entrypoints from plugins
    _.each(lfa.plugins, function (plugin) {
      entrypoints.push(checkEntrypoint(
          path.join(plugin.path, 'frontend', 'styles', 'colors.styl'),
          path.join(plugin.path, 'frontend', 'styles', 'main.styl')));
    });

    // Theme entrypoint
    var theme = (lfa.theme.files['styles'] === 'dir') ? lfa.theme : lfa.defaultTheme;
    var themeStyles = path.join('styles', 'main.styl');
    var themeOverrides = path.join('styles', 'colors.styl');
    var themeEntrypoint = {};
    if (theme.files[themeStyles] === 'file') {
      themeEntrypoint.style = path.join(theme.path, themeStyles);
    }
    if (theme.files[themeOverrides] === 'file') {
      themeEntrypoint.override = path.join(theme.path, themeOverrides);
    }
    entrypoints.push(themeEntrypoint);

    // The main user style entrypoint
    entrypoints.push(checkEntrypoint(
        path.join(config.projectPath, 'styles', 'colors.styl'),
        path.join(config.projectPath, 'styles', 'main.styl')));

    // Collect all entrypoints and turn them into a Stylus configuration object
    var optionsPromise = when.all(entrypoints).then(function (epts) {
      var overrides = [];
      var styles = [];
      _.each(epts, function (ep) {
        if (ep.override) { overrides.push(ep.override); }
        if (ep.style) { styles.push(ep.style); }
      });

      var opts = _.cloneDeep(config.stylus);
      opts.define = opts.define || {};
      opts.define.entrypoints = _(overrides).reverse().concat(styles).value();
      return opts;
    });

    // Delay the compilation pipeline until we finish all the checks
    return lfa.src(path.resolve(__dirname, 'templates', 'index.styl'))
      .pipe(through2.obj(function (file, enc, cb) {
        optionsPromise.then(function (opts) {
          file.stylusOpts = opts;
          cb(null, file);
        });
      }));
  });

  lfa.task('css:files:stylus', ['css:stylus:files:*'], function (stylusFiles) {
    return stylusFiles
      .pipe(sourcemaps.init())
      .pipe(gulpStylus(config.stylus))
      .pipe(sourcemaps.write());
  });
};
