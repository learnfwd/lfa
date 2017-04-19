var utils = require('loader-utils');
var path = require('path');

// Pitching loader. Ignore everything after this loader
module.exports = function () {};

module.exports.pitch = function () {
  this.cacheable(true);
  var query = utils.getOptions(this);
  var pluginPath = query.path;

  var mixinRequest = '!!mixin-loader!' + path.join(pluginPath, 'frontend', 'mixins', 'index.jade');
  var jsRequest = path.join(pluginPath, 'frontend', 'js');

  var mixinsString = query.mixins ? [
    'try { var modIdMixins = require.resolve(', JSON.stringify(mixinRequest), '); } catch (ex) {}\n',
    'if (modIdMixins) { __webpack_require__(modIdMixins); }\n',
  ].join('') : '';

  var jsString = query.js ? [
    'try { var modIdJs = require.resolve(', JSON.stringify(jsRequest), '); } catch (ex) {}\n',
    'if (modIdJs) { module.exports = __webpack_require__(modIdJs); }\n',
  ].join('') : '';

  return mixinsString + jsString;
};

