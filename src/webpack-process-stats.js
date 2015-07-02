var _ = require('lodash');

module.exports = function (stats) {
  stats.warnings = _.filter(stats.warnings || [], function (warning) {
    return (warning.indexOf('Module not found: Error: Cannot resolve \'file\' or \'directory\'') === -1);
  });
  return stats;
};
