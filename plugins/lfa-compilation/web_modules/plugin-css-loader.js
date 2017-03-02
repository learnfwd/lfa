var utils = require('loader-utils');
var loadCssFiles = require('./load-css-files');

// Pitching loader. Ignore everything after this loader
module.exports = function () {};

module.exports.pitch = function () {
  this.cacheable(true);
  var query = utils.getOptions(this);
  var stylesPath = query.path;
  var type = query.type;

  var buf = [];
  loadCssFiles(stylesPath, type, buf);
  return buf.join('');
};
