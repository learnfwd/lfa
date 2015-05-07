var path = require('path');
var when = require('when');
var nodefn = require('when/node');
var fs = require('fs');
var _ = require('lodash');
var autoprefixer = require('autoprefixer-stylus');

function fileExists(file) {
  return nodefn.call(fs.stat, file).then(function (stat) {
    return stat.isFile();
  }).catch(function () {
    return false;
  });
}

function checkEntrypoint(stylePath) {
  var override = path.join(stylePath, 'config.styl');
  var style = path.join(stylePath, 'main.styl');
  var vendor = path.join(stylePath, 'vendor.styl');
  return when.all([
    fileExists(override),
    fileExists(style),
    fileExists(vendor),
  ]).then(function (arr) {
    return {
      override: arr[0] ? override : null,
      style: arr[1] ? style : null,
      vendor: arr[2] ? vendor : null,
    };
  });
}

module.exports = function stylusConfig(lfa) {
  var config = lfa.config;
  config.stylus = config.stylus || {};

  var entrypoints = [];

  // Collect entrypoints from plugins
  _.each(lfa.plugins, function (plugin) {
    entrypoints.push(checkEntrypoint(
        path.join(plugin.path, 'frontend', 'styles')));
  });

  // Theme entrypoint
  entrypoints.push(checkEntrypoint(
        path.join(lfa.theme.path, 'styles')));

  // The main user style entrypoint
  entrypoints.push(checkEntrypoint(
      path.join(config.projectPath, 'styles')));

  // Collect all entrypoints and turn them into a Stylus configuration object
  var optionsPromise = when.all(entrypoints).then(function (epts) {
    var overrides = [];
    var styles = [];
    var vendors = [];
    _.each(epts, function (ep) {
      if (ep.override) { overrides.push(ep.override); }
      if (ep.style) { styles.push(ep.style); }
      if (ep.vendor) { vendors.push(ep.vendor); }
    });

    var opts = _.cloneDeep(config.stylus);
    opts.entrypoints = opts.entrypoints || {};
    opts.use = opts.use || [];
    opts.use.push(autoprefixer());
    opts.entrypoints.vendor = _(overrides).reverse().concat(vendors).value();
    opts.entrypoints.user = styles;
    return opts;
  });

  return optionsPromise;
};
