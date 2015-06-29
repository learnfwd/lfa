var utils = require('loader-utils');
var path = require('path');

// Pitching loader. Ignore everything after this loader
module.exports = function () {};

module.exports.pitch = function () {
  this.cacheable(true);
  var plugins = this.options.lfaPlugins;
  var dummyFile = this.options.dummyFile;
  var type = utils.parseQuery(this.query).type;
  var debug = !!this.options.lfa.currentCompile.debug;

  var buf = [];

  if (!debug) {
    buf.push('var buf = []\n');
  }

  plugins.forEach(function (plugin, idx) {
    if (plugin.package.lfa.hasStyles === false) { return; }

    var pluginPath = path.join(plugin.path, 'frontend', 'styles');
    var loaderRequest = 'plugin-css?path=' + encodeURIComponent(pluginPath) + '&type=' + type;
    var queryString = '!!' + loaderRequest + '!' + dummyFile;

    buf.push('var mod');
    buf.push(idx);
    buf.push(' = require(');
    buf.push(JSON.stringify(queryString));
    buf.push(');\n');
    if (!debug) {
      buf.push('buf.push(mod');
      buf.push(idx);
      buf.push(');\n');
    }
  });

  if (!debug) {
    buf.push('module.exports = buf.join("")');
  }

  return buf.join('');
};

