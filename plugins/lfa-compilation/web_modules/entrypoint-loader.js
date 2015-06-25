var utils = require('loader-utils');
var path = require('path');

// Pitching loader. Ignore everything after this loader
module.exports = function () {};

module.exports.pitch = function () {
  this.cacheable(true);
  var plugins = this.options.lfaPlugins;
  var dummyFile = this.options.dummyFile;
  var type = utils.parseQuery(this.query).type;

  var buf = [];

  if (type === 'js') {
    buf.push('var o = module.exports = {}\n');
  } else {
    buf.push('var buf = []\n');
  }

  plugins.forEach(function (plugin, idx) {
    var loader = (type === 'js') ? 'plugin-js' : 'plugin-css';
    var pluginPath = (type === 'js') ? plugin.path : path.join(plugin.path, 'frontend', 'styles');
    var loaderRequest = loader + '?path=' + encodeURIComponent(pluginPath);
    if (type !== 'js') {
      loaderRequest += '&type=' + ((type === 'css-vendor') ? 'vendor' : 'main');
    }
    var queryString = '!!' + loaderRequest + '!' + dummyFile;

    buf.push('var mod');
    buf.push(idx);
    buf.push(' = require(');
    buf.push(JSON.stringify(queryString));
    buf.push(');\n');
    if (type === 'js') {
      buf.push('o[');
      buf.push(JSON.stringify(plugin.name));
      buf.push('] = mod');
      buf.push(idx);
      buf.push(';\n');
    } else {
      buf.push('buf.push(mod');
      buf.push(idx);
      buf.push(');\n');
    }
  });

  if (type !== 'js') {
    buf.push('module.exports = [[');
    buf.push(JSON.stringify(type));
    buf.push(', buf.join(""), ""]];\n');
  }

  return buf.join('');
};

