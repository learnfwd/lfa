var utils = require('loader-utils');
var path = require('path');
var fs = require('fs');
var loadCssFiles = require('./load-css-files');

// Pitching loader. Ignore everything after this loader
module.exports = function () {};

module.exports.pitch = function () {
  this.cacheable(true);
  var plugins = this.options.lfaPlugins;
  var dummyFile = this.options.dummyFile;
  var type = utils.getOptions(this).type;
  var hasStylesTypeKey = (type === 'vendor' ? 'hasVendorStyles' : 'hasMainStyles');

  var buf = [];

  plugins.forEach(function (plugin, idx) {
    if (plugin.package.lfa.hasStyles === false) { return; }
    if (plugin.package.lfa[hasStylesTypeKey] === false) { return; }

    var pluginPath = path.join(plugin.path, 'frontend', 'styles');
    loadCssFiles(pluginPath, type, buf);
  });

  return buf.join('');
};
