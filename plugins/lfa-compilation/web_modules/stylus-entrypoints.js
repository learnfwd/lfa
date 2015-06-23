var loaderUtils = require('loader-utils');
var _ = require('lodash');

module.exports = function () {
  this.cacheable(true);
  var query = loaderUtils.parseQuery(this.query);
  var entrypoints = this.options.stylus.entrypoints[query.key];
  var result = _.map(entrypoints, function (ep) {
    return '@import "' + ep.replace(/\\/g, '\\"+"') + '"';
  });
  return result.join('\n');
};
